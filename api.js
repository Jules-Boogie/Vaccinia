
const getData = async (state)=> {
    try{
        const results = await axios.get(`https://www.vaccinespotter.org/api/v0/states/${state}.json`);
        const data = await results.data.features
        return data
    }catch(error){
        throw new Error(error)
    }
}

const getState = async(coords)=>{
    try{
        const result = await axios.get(`https://www.mapquestapi.com/geocoding/v1/reverse?key=${config.mapQuestKey}&location=${coords}`);
        const data = await result.data.results[0].locations[0].adminArea3;
        return data;
    }catch(err){
        throw new Error(err);
    }
}