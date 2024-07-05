   // TO MAKE THE MAP APPEAR YOU MUST
	// ADD YOUR ACCESS TOKEN FROM
	// https://account.mapbox.com
	mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: coordinates, // starting position [lng, lat]
        zoom: 5 // starting zoom
    });
   
     console.log(coordinates);
     
    const marker1 = new mapboxgl.Marker({color:"red"})
    .setLngLat(coordinates)
    // .setPopup(
    //     new mapboxgl.Popup({offset:25})
    //     .setHTML(
    //         <h4>Exact location provided after booking!</h4>
    //     )
    // )
    //.setPopup(new mapboxgl.Popup({offset:25}))
    //.setHTML("<h1>Hello World!</h1>")
    .addTo(map);
  
   