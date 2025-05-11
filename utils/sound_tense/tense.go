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
		"sentences1-q-1.json",
		// "sentences1-q-neg-1.json",
		// "sentences2-q-neg-1.json",
		// "sentences3-q-neg-1.json",
		// "sentences4-q-neg-1.json",
		// "sentences5-q-neg-1.json",
		// "sentences6-q-neg-1.json",
		// "sentences7-q-neg-1.json",
		// "sentences8-q-neg-1.json",
		// "sentences9-q-neg-1.json",
		// "sentences10-q-neg-1.json",
		// "sentences1-neg-1.json",
		// "sentences1-neg-2.json",
		// "sentences1-q-1.json",
		// "sentences1-q-2.json",
		// "sentences10-1.json",
		// "sentences10-2.json",
		// "sentences10-neg-1.json",
		// "sentences10-neg-2.json",
		// "sentences10-q-1.json",
		// "sentences10-q-2.json",
		// "sentences2-neg-1.json",
		// "sentences2-neg-2.json",
		// "sentences2-q-1.json",
		// "sentences2-q-2.json",
		// "sentences3-neg-1.json",
		// "sentences3-neg-2.json",
		// "sentences3-q-1.json",
		// "sentences3-q-2.json",
		// "sentences4-neg-1.json",
		// "sentences4-neg-2.json",
		// "sentences4-q-1.json",
		// "sentences4-q-2.json",
		// "sentences5-neg-1.json",
		// "sentences5-neg-2.json",
		// "sentences5-q-1.json",
		// "sentences5-q-2.json",
		// "sentences6-1.json",
		// "sentences6-2.json",
		// "sentences6-neg-1.json",
		// "sentences6-neg-2.json",
		// "sentences6-q-1.json",
		// "sentences6-q-2.json",
		// "sentences7-1.json",
		// "sentences7-2.json",
		// "sentences7-neg-1.json",
		// "sentences7-neg-2.json",
		// "sentences7-q-1.json",
		// "sentences7-q-2.json",
		// "sentences8-1.json",
		// "sentences8-2.json",
		// "sentences8-neg-1.json",
		// "sentences8-neg-2.json",
		// "sentences8-q-1.json",
		// "sentences8-q-2.json",
		// "sentences9-1.json",
		// "sentences9-2.json",
		// "sentences9-neg-1.json",
		// "sentences9-neg-2.json",
		// "sentences9-q-1.json",
		// "sentences9-q-2.json",
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
			if i+1 != 43 {
				continue
			}
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
