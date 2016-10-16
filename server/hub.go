package main

// hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	coordinator *Coordinator

	// Registered clients.
	clients map[*Client]bool

	//unique id
	id int

	//broadcaster
	broadcaster *Client

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			} else if h.broadcaster == client {
				close(h.broadcaster.send);
				h.coordinator.unregister <- h
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message[:len(message)-1]:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}