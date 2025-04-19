package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	r := "../static/sentence/uni"
	d := filepath.Join(r, "audio")
	os.MkdirAll(d, 0755)

	b, _ := os.ReadFile(filepath.Join(r, "sentences.json"))
	var s struct{ Sentences []string }
	json.Unmarshal(b, &s)

	u := "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128"

	for i, t := range s.Sentences {
		j, _ := json.Marshal(map[string]string{"text": t, "model_id": "eleven_multilingual_v2"})
		req, _ := http.NewRequest("POST", u, bytes.NewBuffer(j))
		req.Header.Set("xi-api-key", os.Getenv("ELEVENLABS_API_KEY"))
		req.Header.Set("Content-Type", "application/json")
		res, err := http.DefaultClient.Do(req)
		if err != nil || res.StatusCode != 200 {
			fmt.Printf("fail %02d: %v\n", i+1, err)
			continue
		}
		f, _ := os.Create(filepath.Join(d, fmt.Sprintf("%02d.mp3", i+1)))
		io.Copy(f, res.Body)
		res.Body.Close()
		f.Close()
		fmt.Printf("ok %02d\n", i+1)
	}
}
