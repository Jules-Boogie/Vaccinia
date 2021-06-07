
const getData = async (state)=> {
    try{
        const results = await axios.get(`https://www.vaccinespotter.org/api/v0/states/${state}.json`);
        const data = await results.data.features
        return data
    }catch(error){
        throw new Error(error)
    }
}

