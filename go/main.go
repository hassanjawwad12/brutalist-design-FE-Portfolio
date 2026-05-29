//go:build js && wasm

// portfolio-wasm: a tiny Go program compiled to WebAssembly that ingests the
// portfolio's live GitHub data (passed in from JS as JSON) and computes the
// repo KPIs in Go — proving real Go runs in the browser. Exposed to JS as
// globalThis.__goStats(json) and globalThis.__goVersion().
package main

import (
	"encoding/json"
	"runtime"
	"sort"
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
	Lang  string `json:"lang"`
	Count int    `json:"count"`
}

// card mirrors the TS CardData shape so JS can render it directly.
type card struct {
	Username   string      `json:"username"`
	TotalRepos int         `json:"totalRepos"`
	TotalStars int         `json:"totalStars"`
	TotalForks int         `json:"totalForks"`
	Languages  []langCount `json:"languages"`
	TopName    string      `json:"topName"`
	TopStars   int         `json:"topStars"`
	TopLang    string      `json:"topLang"`
	RecentName string      `json:"recentName"`
	RecentDate string      `json:"recentDate"`
}

func computeStats(jsonStr string) string {
	var d data
	if err := json.Unmarshal([]byte(jsonStr), &d); err != nil {
		return `{"error":"could not parse repo data"}`
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

	recentDate := recent.Updated
	if len(recentDate) >= 10 {
		recentDate = recentDate[:10]
	}

	out := card{
		Username:   d.Username,
		TotalRepos: len(d.Repos),
		TotalStars: totalStars,
		TotalForks: totalForks,
		Languages:  ranked,
		TopName:    dash(top.Name),
		TopStars:   top.Stars,
		TopLang:    dash(top.Language),
		RecentName: dash(recent.Name),
		RecentDate: dash(recentDate),
	}
	b, err := json.Marshal(out)
	if err != nil {
		return `{"error":"marshal failed"}`
	}
	return string(b)
}

func dash(s string) string {
	if s == "" {
		return "—"
	}
	return s
}

func goStats(_ js.Value, args []js.Value) any {
	if len(args) == 0 {
		return `{"error":"no input"}`
	}
	// args[0].String() panics if the JS value isn't a string; that panic would
	// escape the callback and crash the module. Guard the type and return JSON.
	if args[0].Type() != js.TypeString {
		return `{"error":"argument must be a string"}`
	}
	return computeStats(args[0].String())
}

func goVersion(_ js.Value, _ []js.Value) any {
	return runtime.Version()
}

func main() {
	// These js.Func handles are intentionally never Released: they must stay
	// callable for the lifetime of the page, and select{} below blocks forever,
	// so there is no teardown point at which releasing them would be correct.
	js.Global().Set("__goStats", js.FuncOf(goStats))
	js.Global().Set("__goVersion", js.FuncOf(goVersion))
	// Keep the Go runtime alive so the exported functions remain callable.
	select {}
}
