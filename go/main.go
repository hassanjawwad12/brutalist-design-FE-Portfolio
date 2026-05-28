//go:build js && wasm

// portfolio-wasm: a tiny Go program compiled to WebAssembly that ingests the
// portfolio's live GitHub data (passed in from JS as JSON) and computes the
// repo KPIs in Go — proving real Go runs in the browser. Exposed to JS as
// globalThis.__goStats(json) and globalThis.__goVersion().
package main

import (
	"encoding/json"
	"fmt"
	"runtime"
	"sort"
	"strings"
	"syscall/js"
)

type repo struct {
	Name     string `json:"name"`
	Language string `json:"language"`
	Stars    int    `json:"stars"`
	Forks    int    `json:"forks"`
	Updated  string `json:"updated"`
}

type data struct {
	Username string `json:"username"`
	Repos    []repo `json:"repos"`
}

type langCount struct {
	Lang  string
	Count int
}

func computeStats(jsonStr string) string {
	var d data
	if err := json.Unmarshal([]byte(jsonStr), &d); err != nil {
		return "error: could not parse repo data: " + err.Error()
	}
	if len(d.Repos) == 0 {
		return "no repository data available."
	}

	totalStars, totalForks := 0, 0
	langs := map[string]int{}
	var top, recent repo
	for _, r := range d.Repos {
		totalStars += r.Stars
		totalForks += r.Forks
		if r.Language != "" {
			langs[r.Language]++
		}
		if r.Stars > top.Stars {
			top = r
		}
		if r.Updated > recent.Updated {
			recent = r
		}
	}

	ranked := make([]langCount, 0, len(langs))
	for l, c := range langs {
		ranked = append(ranked, langCount{l, c})
	}
	sort.Slice(ranked, func(i, j int) bool {
		if ranked[i].Count != ranked[j].Count {
			return ranked[i].Count > ranked[j].Count
		}
		return ranked[i].Lang < ranked[j].Lang
	})

	langParts := make([]string, 0, 6)
	for i, lc := range ranked {
		if i >= 6 {
			break
		}
		langParts = append(langParts, fmt.Sprintf("%s %d", lc.Lang, lc.Count))
	}

	recentDate := recent.Updated
	if len(recentDate) >= 10 {
		recentDate = recentDate[:10]
	}

	lines := []string{
		fmt.Sprintf("@%s — public repos: %d · stars: %d · forks: %d",
			d.Username, len(d.Repos), totalStars, totalForks),
		"languages: " + strings.Join(langParts, " · "),
		fmt.Sprintf("top repo:    %s (%d★, %s)", top.Name, top.Stars, dash(top.Language)),
		fmt.Sprintf("most recent: %s (%s)", recent.Name, recentDate),
	}
	return strings.Join(lines, "\n")
}

func dash(s string) string {
	if s == "" {
		return "—"
	}
	return s
}

func goStats(_ js.Value, args []js.Value) any {
	if len(args) == 0 {
		return "error: no input"
	}
	return computeStats(args[0].String())
}

func goVersion(_ js.Value, _ []js.Value) any {
	return runtime.Version()
}

func main() {
	js.Global().Set("__goStats", js.FuncOf(goStats))
	js.Global().Set("__goVersion", js.FuncOf(goVersion))
	// Keep the Go runtime alive so the exported functions remain callable.
	select {}
}
