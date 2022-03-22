import Link from "next/link";
import {useRouter} from "next/router";
import Image from "next/image";
import {useEffect} from "react";

const Navigation = (props) => {
    const router = useRouter()
    const pathname = router.pathname

    useEffect(()=>{
        const aTagGroup = document.getElementsByTagName('a')
        switch (pathname){
            case '/monitoring' :
                aTagGroup[0].classList.add('active'); props.onPushEvent( aTagGroup[0].innerText, pathname); break;
            case '/monitoring/[id]' :
                aTagGroup[1].classList.add('active'); props.onPushEvent( aTagGroup[1].innerText, pathname); break;
            case '/analysis/event' :
                aTagGroup[2].classList.add('active'); props.onPushEvent( aTagGroup[2].innerText, pathname); break;
            case '/analysis/operationlog':
                aTagGroup[3].classList.add('active'); props.onPushEvent( aTagGroup[3].innerText, pathname); break;
            case '/analysis/detectlog' :
                aTagGroup[4].classList.add('active'); props.onPushEvent( aTagGroup[4].innerText, pathname); break;
            case '/analysis/intersection':
                aTagGroup[5].classList.add('active'); props.onPushEvent( aTagGroup[5].innerText, pathname); break;
            case '/simulator/todplan':
                aTagGroup[6].classList.add('active'); props.onPushEvent( aTagGroup[6].innerText, pathname); break;
            case '/simulator/signalmap':
                aTagGroup[7].classList.add('active'); props.onPushEvent( aTagGroup[7].innerText, pathname); break;
            case '/simulator/startupcode':
                aTagGroup[8].classList.add('active'); props.onPushEvent( aTagGroup[8].innerText, pathname); break;
            case '/simulator/detectconfig':
                aTagGroup[9].classList.add('active'); props.onPushEvent( aTagGroup[9].innerText, pathname); break;
            case '/config/detectvideo':
                aTagGroup[10].classList.add('active'); props.onPushEvent( aTagGroup[10].innerText, pathname); break;
            case '/config/intersection':
                aTagGroup[11].classList.add('active'); props.onPushEvent( aTagGroup[11].innerText, pathname); break;
            case '/config/group':
                aTagGroup[12].classList.add('active'); props.onPushEvent( aTagGroup[12].innerText, pathname); break;
            case '/config/user':
                aTagGroup[13].classList.add('active'); props.onPushEvent( aTagGroup[13].innerText, pathname); break;
            default: break;
        }

        const linkGroup = document.getElementsByTagName('a')
        for(let i = 0 ; i < linkGroup.length ; i++){
            linkGroup[i].addEventListener('click', function(e){
                props.onPushEvent( e.target.innerText, e.target.href)
            })
        }


    },[])

    return (
        <>
            <div className={'logo'}>
                <img src={'/iksan_ci.png'} style={{width: '40px', height: '35px'}}/>
                <label>익산 교통관제 모니터링</label>
            </div>
            <div className={'navItemList'}>
                <div className={'title'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" className="bi bi-person-video3 nav-icon" viewBox="0 0 16 16">
                        <path d="M14 9.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-6 5.7c0 .8.8.8.8.8h6.4s.8 0 .8-.8-.8-3.2-4-3.2-4 2.4-4 3.2Z"/>
                        <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5.243c.122-.326.295-.668.526-1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7.81c.353.23.656.496.91.783.059-.187.09-.386.09-.593V4a2 2 0 0 0-2-2H2Z"/>
                    </svg>
                    <h4>모니터링</h4>
                </div>
                <ul>
                    <li>
                        <Link href='/monitoring'>
                            <a className={`${pathname === '/monitoring' ? 'active' : ''}`}>전체교차로모니터링</a>
                        </Link>
                    </li>
                    <li>
                        <Link href='/monitoring/1?location_id=1'>
                            <a className={`${pathname === '/monitoring/[id]' ? 'active' : ''}`}>교차로모니터링</a>
                        </Link>
                    </li>
                </ul>
                <div className={'title'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" className="bi bi-graph-up nav-icon" viewBox="0 0 16 16">
                        <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"/>
                    </svg>
                    <h4>분석</h4>
                </div>
                <ul>
                    <li>
                        <Link href='/analysis/event'>
                            <a className={`${pathname === '/analysis/event' ? 'active' : ''}`}>이벤트분석</a>
                        </Link>
                    </li>
                    <li>
                        <Link href='/analysis/operationlog'>
                            <a className={`${pathname === '/analysis/operationlog' ? 'active' : ''}`}>운영이력분석</a>
                        </Link>
                    </li>
                    <li>
                        <Link href='/analysis/detectlog'>
                            <a className={`${pathname === '/analysis/detectlog' ? 'active' : ''}`}>검지기이력분석</a>
                        </Link>
                    </li>
                    <li>
                        <Link href='/analysis/intersection'>
                            <a className={`${pathname === '/analysis/intersection' ? 'active' : ''}`}>교차로분석</a>
                        </Link>
                    </li>
                </ul>
                <div className={'title'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" className="bi bi-sliders nav-icon" viewBox="0 0 16 16">
                        <path d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3h9.05zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8h2.05zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1h9.05z"/>
                    </svg>
                    <h4>제어기설정</h4>
                </div>
                <ul>
                    <li>
                        <Link href='/simulator/todplan'>
                            <a className={`${pathname === '/simulator/todplan' ? 'active' : ''}`}>TODPLAN</a>
                        </Link>
                    </li>
                    <li>
                        <Link href='/simulator/signalmap'>
                            <a className={`${pathname === '/simulator/signalmap' ? 'active' : ''}`}>SIGNALMAP</a>
                        </Link>
                    </li>
                    <li>
                        <Link href='/simulator/startupcode'>
                            <a className={`${pathname === '/simulator/startupcode' ? 'active' : ''}`}>STARTUPCODE</a>
                        </Link>
                    </li>
                    <li>
                        <Link href='/simulator/detectconfig'>
                            <a className={`${pathname === '/simulator/detectconfig' ? 'active' : ''}`}>검지기설정</a>
                        </Link>
                    </li>
                </ul>
                <div className={'title'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" className="bi bi-pin-map nav-icon" viewBox="0 0 16 16">
                        <path d="M3.1 11.2a.5.5 0 0 1 .4-.2H6a.5.5 0 0 1 0 1H3.75L1.5 15h13l-2.25-3H10a.5.5 0 0 1 0-1h2.5a.5.5 0 0 1 .4.2l3 4a.5.5 0 0 1-.4.8H.5a.5.5 0 0 1-.4-.8l3-4z"/>
                        <path d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999z"/>
                    </svg>
                    <h4>교차로설정</h4>
                </div>
                <ul>
                    <li>
                        <Link href='/config/detectvideo'>
                            <a className={`${pathname === '/config/detectvideo' ? 'active' : ''}`}>영상검지기설정</a>
                        </Link>
                    </li>
                    <li>
                        <Link href='/config/intersection'>
                            <a className={`${pathname === '/config/intersection' ? 'active' : ''}`}>기반데이터설정</a>
                        </Link>
                    </li>
                    <li>
                        <Link href='/config/group'>
                            <a className={`${pathname === '/config/group' ? 'active' : ''}`}>그룹설정</a>
                        </Link>
                    </li>
                </ul>
                <div className={'title'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" className="bi bi-person-plus nav-icon" viewBox="0 0 16 16">
                        <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                        <path d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                    </svg>
                    <h4>시스템설정</h4>
                </div>
                <ul>
                    <li>
                        <Link href='/config/user'>
                            <a className={`${pathname === '/config/user' ? 'active' : ''}`}>사용자설정</a>
                        </Link>
                    </li>
                </ul>
            </div>

            <style jsx>{`
              .logo{
                color: white;
                display: flex;
                align-items: center;
                margin-top: 30px;
                margin-left: 10px;
              }
              .logo label{
                margin-left: 4px;   
                font-size: 18px;             
                font-weight: bold;
              }
              .navItemList{
                margin-top: 30px;
                margin-left: 15px;
              }
              .navItemList h4:not(:first-child){
                margin: 30px 0px 10px 0px;
              }
              
              .navItem{
                display: block;
              }
              .title{
                font-weight: bold;
                color: white;
              }
              a{
                  color: #AEAEAE;
                  text-decoration: none;
                  font-size: 14px;
              }
              ul{
                list-style: none;
              }
              li{
                margin: 0px 0px 10px 30px;
              }
              .active{
                color: white;
              }
              .nav-icon{
                float: left;
                margin-right: 10px;
              }
            `}</style>
        </>

    );
};

export default Navigation;
