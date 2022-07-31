export default interface IHighlightRange {
    startNode : {
        nodeId : String,
        offset: number
    },
    endNode : {
        nodeId : String,
        offset : number
    },

    ancestor :{
        nodeId : String,
    }
}