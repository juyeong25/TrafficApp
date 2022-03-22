//액션 타입 선언
const PUSH_ITEM = 'history/PUSH_ITEM'
const SET_ITEM = 'history/SET_ITEM'
const DELETE_ITEM = 'history/DELETE_ITEM'

//액션 생성 함수 선언
export const setItem = item => ({type: SET_ITEM, item})
export const pushItem = (item, link) => ({type: PUSH_ITEM, item, link})
export const deleteItem = (item) => ({type: DELETE_ITEM, item})

//초기 상태 선언
const initialState = []

//리듀서 선언
export default function history(state=initialState, action){
    switch (action.type){
        case SET_ITEM:
            return state.concat(action.item)
        case PUSH_ITEM:
            let array = state.filter((e)=>{return e.name != action.item})
            array.push({name: action.item, link: action.link})
            if(array.length > 3) array.shift()
            return array
        case DELETE_ITEM:
            let returnArray = state
            returnArray = returnArray.filter((e)=>{return e.name != action.item})
            return returnArray
        default: return state;
    }
}