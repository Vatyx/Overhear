package main

import (
	"html/template"
	"log"
	"net/http"

	"golang.org/x/net/websocket"
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
	    if err = conn.WriteMessage(messageType, p); err != nil {
	        return err
    }
}
}

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
	http.HandleFunc("/echo", echoHandler)
	http.HandleFunc("/", index)

	log.Println("Listening on port 3000...")
	http.ListenAndServe(":3000", nil)
}