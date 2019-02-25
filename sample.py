from SkyWay_Gateway import Peer 

peer = Peer(YOUR_PEER_ID, YOUR_API_KEY)
print('Peer created as '+peer.id+': '+peer.token)
while True:
    for data in peer.getDataConnections():
        if not data.getQueue().empty():
            print('Incoming: '+data.getQueue().get().decode())

            