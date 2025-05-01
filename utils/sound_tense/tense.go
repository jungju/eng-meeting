package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	r := "../../static/assets/tense"
	d := filepath.Join(r, "audio")
	os.MkdirAll(d, 0755)
	files := []string{
		"sentences1-2.json",
		"sentences2-2.json",
		"sentences3-2.json",
		"sentences4-2.json",
		"sentences5-2.json",
	}
	u := "https://api.elevenlabs.io/v1/text-to-speech/UgBBYS2sOqTuMpoF3BR0?output_format=mp3_44100_128"
	key := os.Getenv("ELEVENLABS_API_KEY")
	for _, fn := range files {
		data, err := os.ReadFile(filepath.Join(r, fn))
		if err != nil {
			fmt.Printf("read %s: %v\n", fn, err)
			continue
		}
		var ss []string
		if err := json.Unmarshal(data, &ss); err != nil {
			fmt.Printf("unmarshal %s: %v\n", fn, err)
			continue
		}
		prefix := strings.TrimPrefix(strings.TrimSuffix(fn, ".json"), "sentences")
		for i, text := range ss {
			body, _ := json.Marshal(map[string]interface{}{
				"text":           text,
				"model_id":       "eleven_multilingual_v2",
				"voice_settings": map[string]interface{}{"speed": 0.7},
			})
			req, _ := http.NewRequest("POST", u, bytes.NewBuffer(body))
			req.Header.Set("xi-api-key", key)
			req.Header.Set("Content-Type", "application/json")
			res, err := http.DefaultClient.Do(req)
			if err != nil || res.StatusCode != http.StatusOK {
				fmt.Printf("fail %s [%d]: %v\n", fn, i+1, err)
				continue
			}
			out := fmt.Sprintf("%s-%d.mp3", prefix, i+1)
			f, _ := os.Create(filepath.Join(d, out))
			io.Copy(f, res.Body)
			res.Body.Close()
			f.Close()
			fmt.Printf("ok %s -> %s\n", fn, out)
		}
	}
}
