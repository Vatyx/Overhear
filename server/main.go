package main

import (
	"html/template"
	"fmt"
	"log"
	"net/http"
	"runtime"
)

func index(w http.ResponseWriter, r *http.Request) {
	t := template.New("index")
	var filepath string
	if os := runtime.GOOS; os == "darwin" || os == "linux" {
		filepath = "templates/index.html"
	} else {
		/* assume Windows */
		filepath = "templates\\index.html"
	}

	t, err := template.ParseFiles(filepath)
	if(err != nil) {
		panic(err)
	}

	err = t.Execute(w, nil)
	if(err != nil) {
		panic(err)
	}
}

func main() {
	coordinator := newCoordinator()
	go coordinator.run()

	fs := http.FileServer(http.Dir("public"));
	http.Handle("/public/", http.StripPrefix("/public/", fs))
	http.HandleFunc("/newhub", func(w http.ResponseWriter, r *http.Request) {
		createHub(coordinator, w, r)
	})
	http.HandleFunc("/getBroadcaster", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("About to assign broadcaster")
		getBroadcaster(coordinator, w, r)
	})
	http.HandleFunc("/newconn", func(w http.ResponseWriter, r *http.Request) {
		serveWs(coordinator, w, r)
	})
	http.HandleFunc("/", index)

	log.Println("Listening on port 3000...")
	http.ListenAndServe(":3000", nil)
}
