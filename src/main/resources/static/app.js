async function getLocation(){
    try {
        const data = await fetch ("https://ipapi.co/json/");
        const reply = await data.json();

        if (!data.ok){
            throw new Error(reply.error);
        }

        return{
            region: reply.region, 
            city: reply.city
        };

    } 
    catch (error) {
        console.error("Failed to get location:", error.message);
        return null;
    }
}

getLocation().then(location => {
    console.log(location);
});