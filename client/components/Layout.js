import Navigation from "./Navigation";
import Header from "./Header";
// import axios from "axios";
import Login from './../pages/auth/login'

import { useSelector, useDispatch } from "react-redux";
import { pushItem, deleteItem } from "../service/modules/history";

const Layout = ({children}) => {

     const { history } = useSelector(state=>({
         history: state.history,
     }))

    const dispatch = useDispatch()
    const onPushItem = (item, link) => dispatch(pushItem(item, link))
    const onDeleteItem = item => dispatch(deleteItem(item))
    return <>
        { children.props.userId == undefined  ? <Login />:
            <div>
                <div className={'navigation'}>
                    <Navigation onPushEvent={onPushItem}/>
                </div>
                <div className={'header'}>
                    <Header list={history} onDeleteEvent={onDeleteItem} user={children.props.userId}/>
                </div>
                <div className={'content'}>
                    {children}
                </div>
            </div>
        }


        <style jsx>{`

            .navigation{
              width: 240px;
              height: 100vh;
              padding: 0px 15px;
              background-color: #293042;
              float:left;
            }
            
            .header{
              height: 24px;
              margin-left: 270px;
              padding: 12px;
              background-color: white;
              box-shadow: 0px 2px .1px  rgb(245, 245, 245);
              display: flex;
            }
            
            .content{
              margin-left: 270px;
              padding: 20px;
            }
        `}</style>

    </>
};
// export async function getServerSideProps(context) {
//     console.log('getServerSideProps')
//     const token = await axios.post('http://192.168.1.43:3001/user',{
//         userId:'superadmin',
//         password:'xhdtlsqhdks1',
//         admin: true
//     })
//     context.res.setHeader('set-Cookie', `Authorization=${token.data['accessToken']}; HttpOnly`)
//     return {
//         props: {
//             data:{'test':'test'}
//         }, // will be passed to the page component as props
//     }
// }
export default Layout;
