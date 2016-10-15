package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"runtime"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}

func echo(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }

    for {
	    messageType, p, err := conn.ReadMessage()
	    if err != nil {
	        return
	    }
	    fmt.Println("%s", messageType)
	    fmt.Println("%s", p)

	    err = conn.WriteMessage(messageType, p)
	    if err != nil {
	        return 
	    }
    }
}

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
	fs := http.FileServer(http.Dir("public"));
	http.Handle("/public/", http.StripPrefix("/public/", fs))
	http.HandleFunc("/echo", echo)
	http.HandleFunc("/", index)

	log.Println("Listening on port 3000...")
	http.ListenAndServe(":3000", nil)
}
