
export const authCheck = async (ctx) => {
    console.log('server side run')
    const cookies = ctx.req.cookies
    let returnObject
    if (!cookies['Authorization']){
        //쿠키에 토큰이 있는지 확인
        returnObject = {
            redirect: {
                permanent: false,
                destination: "/auth/login",
            },
            props:{},
        }
    }else{
        //쿠키에 토큰이 있다면 GET USER
        let response = await fetch("http://192.168.1.43:3001/user/login",{
            method : "GET",
            headers : {
                'Cache-Control': 'no-cache',
                'Authorization': `Bearer ${cookies['Authorization']}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then((response) => response.json()).then(data => { return data; })

        if (response.userId){
            returnObject = {
                props: {
                    jwt: cookies['Authorization'],
                    userId: response.userId
                }
            }
        }else if(response.statusCode == 401){
            returnObject = {
                redirect: {
                    permanent: false,
                    destination: "/auth/login",
                },
                props:{},
            }
        }else{
            returnObject = {
                redirect: {
                    permanent: false,
                    destination: "/auth/login",
                },
                props:{},
            }
        }
    }
    return returnObject
    // return {props: {}}
}