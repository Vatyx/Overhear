package main

// hub maintains the set of active clients and broadcasts messages to the
// clients.

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
)


var (
	hubId = 1000
)

type Coordinator struct {
	// Registered hubs.
	hubs map[int]*Hub

	// Register requests from the hubs.
	register chan *Hub

	// Unregister requests from hubs.
	unregister chan *Hub
}

func newCoordinator() *Coordinator {
	return &Coordinator{
		register:   make(chan *Hub),
		unregister: make(chan *Hub),
		hubs:       make(map[int]*Hub),
	}
}

func (c *Coordinator) run() {
	for {
		select {
		case hub := <-c.register:
			c.hubs[hub.id] = hub
		case hub := <-c.unregister:
			if _, ok := c.hubs[hub.id]; ok {
				delete(c.hubs, hub.id)
			}
		}
	}
}

type NewHub struct{
	id int
}

func createHub(c *Coordinator, w http.ResponseWriter, r *http.Request) {
	fmt.Println("New Hub with id ", hubId)
	hub := &Hub{
		coordinator: c,
		id:          hubId,
		broadcaster: nil,
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}

	c.register <- hub

	sentId := hubId
	hubId += 1

	go hub.run()

	fmt.Fprintf(w, "%d", sentId)
}

func getBroadcaster(c *Coordinator, w http.ResponseWriter, r *http.Request) {
	fmt.Println("Broadcaster for a hub has joined!")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	url := r.URL
	values := url.Query()
	hid, ok := values["id"]
	if !ok {
    	http.Error(w, "No id passed by request", 500)
    	return
	}

	actualid, err := strconv.Atoi(hid[0])
	if err != nil {
		http.Error(w, "Malformed id given in parameters", 500)
    	return
	}

    hub, ok := c.hubs[actualid]
    if !ok {
    	http.Error(w, "Specified hub not found", 500)
    	return
    }

	client := &Client{hub: hub, id: id, conn: conn, send: make(chan []byte, 256)}

	hub.broadcaster = client
	id += 1

	go hub.broadcaster.readPump()
}
