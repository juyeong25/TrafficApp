
import Link from "next/link";
import {DateTimeToString} from "../service/dateToString";
import { removeCookies } from 'cookies-next';
import Router from "next/router";

function Header(props){


    const ActionButton = () => {
        let content = []
        const deleteEvent =(content)=>{
            props.onDeleteEvent(content.target.id.split('-')[1])
        }
        props.list.map((item, index)=>{
            content.push(
                <div key={'history-'+item.name+index} style={ActionButtonStyle}>
                    <Link href={item.link}>
                        <span style={ActionButtonTitle} >{item.name}</span>
                    </Link>
                    <div style={ActionButtonIconStyle}>
                        <img src={'/cancle.png'} style={{width:'10px', height:'10px'}} id={'history-'+item.name+'-'+index} onClick={deleteEvent.bind()}/>
                    </div>
                </div>
            )
        })
        return content
    }

    const ActionButtonStyle = {
        border: '1px solid #707070',
        borderRadius: '8px',
        height: '20px',
        float: 'left',
        marginLeft: '10px',
        padding: '0px 7.2px 0px 10px',
        lineHeight: '20px',
    }
    const ActionButtonIconStyle = {
        float: 'left',
        height: '10px',
        width: '10px',
        cursor: 'pointer',
    }
    const ActionButtonTitle = {
        float: 'left',
        marginRight:'7px',
        color: '#707070',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold',
    }

    const logoutEvent =() => {
        removeCookies('Authorization');
        swal("[Logout]", 'Logout...', "error", {
            buttons: [false],
            timer: 2000,
        }).then((value) => {
            Router.push('/auth/login')
        })
    }

    return (
        <>
            {/*action button component*/}
            <div className={'actionButton'}>
                { ActionButton() }
            </div>
            <div style={{marginLeft:'auto'}}>
                <div className={'headerItem'} onClick={logoutEvent}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#293042" className="bi bi-person-circle" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                    </svg>
                    <label>{props.user}</label>
                </div>
                <div className={'headerItem'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#293042" className="bi bi-hourglass-split" viewBox="0 0 16 16">
                        <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2h-7zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48V8.35zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
                    </svg>
                    <label>09:30</label>
                </div>
                <div className={'headerItem'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#293042" className="bi bi-clock" viewBox="0 0 16 16">
                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                    <label>{}</label>
                    {/*DateTimeToString(new Date, '-')*/}
                </div>
            </div>


            <style jsx>{`
                .headerItem{
                  float: right;
                  display: flex;
                  align-items: center;
                }
                label{
                  height: 24px;
                  margin: 0px 10px;
                  font-weight: bold;
                  color: #293042;
                }
                
            `}</style>
        </>
    );
};

export default Header;
