package main

import (
	"html/template"
	"log"
	"net/http"
)

func index(w http.ResponseWriter, r *http.Request) {
	t := template.New("index")
	t, err := template.ParseFiles("templates\\index.html")
	if(err != nil) {
		panic(err)
	}

	err = t.Execute(w, nil)
	if(err != nil) {
		panic(err)
	}
}

func main() {
	fs := http.FileServer(http.Dir("public"));
	http.Handle("/public/", http.StripPrefix("/public/", fs))
	http.HandleFunc("/", index)

	log.Println("Listening on port 3000...")
	http.ListenAndServe(":3000", nil)
}