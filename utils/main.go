package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

/* ────── ✨ Easily‑tweakable settings (top of file) ✨ ────── */
var (
	// Folder that contains sentences.json and where MP3 sub‑folders will be created.
	basePath = "../static/assets/sentence/story_s7" // 🔄 change as needed

	/* English voice candidates (ElevenLabs voice IDs)
	   - "XfNU2rGpBa01ckF309OY" : Teacher‑like voice
	   - "qJT4OuZyfpn7QbUnrLln": Young girl voice
	   - "UgBBYS2sOqTuMpoF3BR0": Calm narrator voice
	*/
	voiceIDEn = "XfNU2rGpBa01ckF309OY" // 🔄 choose English voice ID

	/* Korean voice candidates (ElevenLabs voice IDs)
	   - "KO_ID_1" : Korean male
	   - "KO_ID_2" : Korean female (soft tone)
	*/
	//voiceIDKo = "xi3rF0t7dg7uN2M0WUhr" // 아이 목소리
	voiceIDKo = "uyVNoMrnUku1dZyVEXwD"

	modelID = "eleven_multilingual_v2" // TTS model
	//speechSPD = 0.7                      // Reading speed (0.5‑2.0)
)

/* ─────────────────────────────────────────────────────────── */

func main() {
	// Show date/time & file for every log entry.
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	dirEn := filepath.Join(basePath, "audio")  // English MP3s
	dirKo := filepath.Join(basePath, "audiok") // Korean MP3s
	for _, p := range []string{dirEn, dirKo} {
		if err := os.MkdirAll(p, 0o755); err != nil {
			log.Fatalf("mkdir %s: %v", p, err)
		}
	}

	// 1) Load JSON with sentences and Korean translations
	data, err := os.ReadFile(filepath.Join(basePath, "sentences.json"))
	if err != nil {
		log.Fatal(err)
	}
	var pack struct {
		Sentences []string `json:"sentences"`
		Korean    []string `json:"korean"`
	}
	if err := json.Unmarshal(data, &pack); err != nil {
		log.Fatal(err)
	}

	// 2) English TTS → audio/
	for i, t := range pack.Sentences {
		out := filepath.Join(dirEn, fmt.Sprintf("%02d.mp3", i+1))
		if err := saveTTS(voiceIDEn, t, out, 0.7); err != nil {
			log.Printf("ENG %02d ❌ %v", i+1, err)
		} else {
			log.Printf("ENG %02d ✅ saved to %s", i+1, out)
		}
	}

	// 3) Korean TTS → audiok/
	for i, t := range pack.Korean {
		out := filepath.Join(dirKo, fmt.Sprintf("%02d.mp3", i+1))
		if err := saveTTS(voiceIDKo, t, out, 1); err != nil {
			log.Printf("KOR %02d ❌ %v", i+1, err)
		} else {
			log.Printf("KOR %02d ✅ saved to %s", i+1, out)
		}
	}
}

// saveTTS converts "text" to speech using the ElevenLabs API and writes the resulting MP3 audio to the specified outfile.
// Parameters:
// - voiceID: A string representing the voice ID to be used for TTS.
// - text: The input text to be converted to speech.
// - outfile: The path to the output file where the MP3 audio will be saved.
// - speechSPD: A float64 representing the desired speech speed, where typical values range between 0.5 and 2.0.
//
// This function constructs a JSON payload containing the text, model ID, and voice settings, and sends it via a POST request
// to the ElevenLabs text-to-speech API endpoint. The API key for ElevenLabs is passed in the request headers using an
// environment variable ("ELEVENLABS_API_KEY").
//
// If the API response is successful (HTTP 200), the function writes the binary MP3 data from the response body to the
// specified outfile. If any errors occur during the process (HTTP errors, file writing errors), the function returns
// an error describing the issue.
func saveTTS(voiceID, text, outfile string, speechSPD float64) error {
	payload, _ := json.Marshal(map[string]any{
		"text":     text,
		"model_id": modelID,
		"voice_settings": map[string]any{
			"speed": speechSPD,
		},
	})
	url := fmt.Sprintf(
		"https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=mp3_44100_128",
		voiceID,
	)

	req, _ := http.NewRequest("POST", url, bytes.NewReader(payload))
	req.Header.Set("xi-api-key", os.Getenv("ELEVENLABS_API_KEY"))
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("received non-OK HTTP status: %s", res.Status)
	}

	f, err := os.Create(outfile)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer f.Close()

	_, err = io.Copy(f, res.Body)
	if err != nil {
		return fmt.Errorf("failed to write to output file: %w", err)
	}

	return nil
}
