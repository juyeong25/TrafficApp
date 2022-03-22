import {useState, useRouter} from 'react';
import axios from "axios";
import Router from 'next/router';
import swal from 'sweetalert2';
import cookie from 'js-cookie'
function Login(props) {
    Login.displayName = 'Login'

    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')

    const getJwtToken = async (credentials) => {
        return await fetch('http://192.168.1.43:3001/user/accessToken',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials),
            credentials: 'include'
        })
            .then(data=>data.json())

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await getJwtToken({
            userId, password, admin:true
        })
        console.log(response)
        cookie.set('Authorization', response.accessToken)
        if ('accessToken' in response) {
            await swal.fire("Login Success", '^_^', "success", {
                buttons: [false],
                timer: 2000,
            })
                .then((value) => {
                    // Router.push('/monitoring')
                    window.location.href = '/monitoring'
                })
        }else {
            await swal("Failed", 'ㅠ_ㅠ', "error");
        }
    }

    return (
        <>
            <div className={'login-box'}>
                <div className={'title'}>
                    <img src={'/iksan_image_white_2.png'} />
                    <h2>익산 교통관제 모니터링</h2>
                    <h3>DONGBU ICT</h3>
                </div>
                <div className={'login-items'}>
                    <h2>LOGIN</h2>
                    <form onSubmit={handleSubmit}>
                        <h4>USERNAME</h4>
                        <input placeholder={'USERNAME'} name={'userId'} onChange={e => setUserId(e.target.value)}/>
                        <h4>PASSWORD</h4>
                        <input type={'password'} placeholder={'PASSWORD'} onChange={e=>setPassword(e.target.value)}/>
                        <button type={'submit'} >LOGIN</button>
                    </form>

                </div>
            </div>

            <style jsx>{`

              .login-box {
                width: 720px;
                height: 420px;
                background-color: white;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: 50%;
                margin-top: -210px;
                box-shadow: 5px 5px 3px #cecece;
                border-radius: 10px;
                display: flex;
              }
              .title{
                background-color: #293042;
                width: 50%;
                height: 100%;
                border-radius: 10px 0px 0px 10px;
                text-align: right;
              }
              .title img{
                width: 300px;
                margin-right: 10px;
                margin-top: 25px;

              }
              .title h2{
                color: white;
                margin-right: 10px;
              }
              .title h3{
                color: #707070;
                margin-right: 10px;
                margin-top: 200px;
              }
              .login-items{
                width: 40%;
                padding: 25px 0px;
                left: 50%;
                transform: translateX(+25%);
              }
              .login-items h2{
                margin: 35px 0px;
              }
              .login-items h4{
                margin-bottom: 10px;
              }
              .login-items input{
                width: 220px;
                height: 23px;
                padding: 5px 10px;
                border-radius: 10px;
                border: 2px solid #293042;
                display: block;
                margin-bottom: 10px;
              }
              .login-items button{
                width: 245px;
                height: 34px;
                border-radius: 10px;
                margin-top: 10px;
              }
              .login-items label{
                color: darkred;
                width: 200px;
                height: 20px;
                font-size: 14px;
              }
            `}</style>
        </>
    );

};

export default Login;
