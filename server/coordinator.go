package main

// hub maintains the set of active clients and broadcasts messages to the
// clients.

import (
	"fmt"
	"encoding/json"
	"log"
	"net/http"
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
	fmt.Println("New Hub with id %d!", hubId)
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
	
	h := NewHub{id: hubId}
	hubId += 1

	go hub.run()

	json.NewEncoder(w).Encode(h)	
}

func getBroadcaster(c *Coordinator, w http.ResponseWriter, r *http.Request) {
	fmt.Println("Broadcaster for a hub has joined!")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	var h NewHub
    if r.Body == nil {
        http.Error(w, "No hub id specified", 400)
        return
    }
    err = json.NewDecoder(r.Body).Decode(&h)
    if err != nil {
            http.Error(w, err.Error(), 400)
            return
    }

    hub, ok := c.hubs[h.id]
    if !ok {
    	http.Error(w, "Specified hub not found", 500)
    	return
    }

	client := &Client{hub: hub, id: id, conn: conn, send: make(chan []byte, 256)}

	hub.broadcaster = client
	id += 1

	go hub.broadcaster.readPump()
}