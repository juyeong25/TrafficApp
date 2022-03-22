import {useState ,useEffect} from 'react';
import Container from "../../components/Container";
import axios from "axios";
import {authCheck} from "../../authCheck";

const UserConfig = () => {

    const [pageIndex, setPageIndex] = useState(0)
    const [maxIndex, setMaxIndex] = useState(1)
    const [userList, setUserList] = useState([
        {user_id: 1, allowed_ip: '*', role: 'superadmin', create_date: '', creator: 'superadmin', last_modify: '' ,modifier: '', comment: ''},
        {user_id: 2, allowed_ip: '*', role: 'police', create_date: '2022-02-21 15:28:00', creator: 'superadmin', last_modify: '' ,modifier: '', comment: '경찰 모니터링 전용 계정'},
    ])

    useEffect(()=>{
        setMaxIndex(Math.ceil(userList.length/10))
    },[])
    useEffect(()=>{
        setMaxIndex(Math.ceil(userList.length/10))
        console.log(userList)
    },[userList])

    //table index
    const createIndex = () => {
        let index_array =[]
        let index = []
        if((10*Math.floor(pageIndex/10))+10 > maxIndex){
            for(let i = (10*Math.floor(pageIndex/10)); i < maxIndex; i++){
                if(i == (10*Math.floor(pageIndex/10))){
                    index_array.push(<li className={'index-button active'} key={'index-button-'+(i+1)} onClick={changeIndex.bind(this)} id={'pageIndex_'+i}>{i+1}</li>)
                }else {
                    index_array.push(<li className={'index-button'} key={'index-button-'+(i+1)} onClick={changeIndex.bind(this)} id={'pageIndex_'+i}>{i+1}</li>)
                }
            }
        }else {
            for(let i = (10*Math.floor(pageIndex/10)); i < (10*Math.floor(pageIndex/10))+10; i++){
                if(i == (10*Math.floor(pageIndex/10))){
                    index_array.push(<li className={'index-button active'} key={'index-button-'+(i+1)} onClick={changeIndex.bind(this)} id={'pageIndex_'+i}>{i+1}</li>)
                }else {
                    index_array.push(<li className={'index-button'} key={'index-button-'+(i+1)} onClick={changeIndex.bind(this)} id={'pageIndex_'+i}>{i+1}</li>)
                }
            }
        }

        if(maxIndex>10){
            index_array.unshift(<li key={'index_list_update_prevButton'} className={'index-list-update-button'} onClick={IndexListUpdateButton.bind(this)} id={'prevButton'}>◁</li>)
            index_array.push(<li key={'index_list_update_nextButton'}  className={'index-list-update-button'} onClick={IndexListUpdateButton.bind(this)} id={'nextButton'}>▷</li>)
        }

        index.push(<ul key={'index-button-group'} style={index_list_group_style}>{index_array}</ul>)
        return index
    }
    const IndexListUpdateButton = (listUpdateButton) => {
        if(listUpdateButton.target.id === 'prevButton'){
            if(10*Math.floor(pageIndex/10) != 0){
                setPageIndex(parseInt(10*Math.floor(pageIndex/10) - 10))
            }
        }else if(listUpdateButton.target.id === 'nextButton') {
            if(10*Math.floor(pageIndex/10)+10 < maxIndex){
                setPageIndex(parseInt(10*Math.floor(pageIndex/10) + 10))
            }
        }
    }
    const changeIndex = (indexItem) => {
        setPageIndex(parseInt(indexItem.target.id.split('_')[1]))
        document.querySelectorAll(".index-button").forEach((el) => {
            el.classList.remove("active");
        });
        indexItem.target.classList.add('active')
    }
    const index_list_group_style={
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px',
    }

    //button event
    const createUserEvent = () =>{
        const dataTable = document.getElementsByTagName('table')[0]
        const _index = dataTable.getElementsByTagName('tbody')[0].childElementCount

        const newRow = dataTable.getElementsByTagName('tbody')[0].insertRow()
        const cell_radiobox = newRow.insertCell()
        cell_radiobox.innerHTML = `<input type='radio' id='id-`+(_index)+`' name='data-table-cell' /><label htmlFor='id-`+(_index)+`'></label>`
        const cell_index = newRow.insertCell()
        cell_index.innerText = _index + 1
        const cell_id = newRow.insertCell()
        cell_id.innerText = userList[userList.length-1].user_id+1
        const cell_ip = newRow.insertCell()
        cell_ip.innerHTML = `<input />`
        const cell_role = newRow.insertCell()
        cell_role.innerHTML = `<input />`
        const cell_create_date = newRow.insertCell()
        cell_create_date.innerHTML = `<input />`
        const cell_creator = newRow.insertCell()
        cell_creator.innerHTML = `<input />`
        const cell_last_modify = newRow.insertCell()
        cell_last_modify.innerHTML = `<input />`
        const cell_modifier = newRow.insertCell()
        cell_modifier.innerHTML = `<input />`
        const cell_comment = newRow.insertCell()
        cell_comment.innerHTML = `<input />`
        const cell_button = newRow.insertCell()
        cell_button.innerHTML = `<button>저장</button><button>취소</button>`

        cell_button.getElementsByTagName('button')[0].addEventListener('click', saveUserList)
        cell_button.getElementsByTagName('button')[1].addEventListener('click', cancelUserList)
    }
    const saveUserList = () => {
        const last_row = document.getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')
        const dataRow = last_row[last_row.length-1]
        const dataRow_tds = dataRow.querySelectorAll('td')

        const _saveData = {
            user_id: parseInt(dataRow_tds[2].innerText),
            allowed_ip: dataRow_tds[3].querySelector('input').value,
            role: dataRow_tds[4].querySelector('input').value,
            create_date: dataRow_tds[5].querySelector('input').value,
            creator: dataRow_tds[6].querySelector('input').value,
            last_modify: dataRow_tds[7].querySelector('input').value ,
            modifier: dataRow_tds[8].querySelector('input').value,
            comment:  dataRow_tds[9].querySelector('input').value
        }
        cancelUserList()

        let sortData = userList
        sortData.push(_saveData)
        sortData = sortData.sort(function(a,b){
            return a.user_id < b.user_id ? -1 : a.user_id > b.user_id ? 1 : 0;
        })

        setUserList([...sortData])
    }
    const cancelUserList = () =>{
        const dataTable = document.getElementsByTagName('table')[0]
        dataTable.getElementsByTagName('tbody')[0].deleteRow(-1)
    }
    const updateUserList = () => {
        const tbody = document.querySelector('table').querySelector('tbody')
        const selected_id = document.querySelector('input[type="radio"]:checked').id.split(('-'))[1]
        const selected_row = tbody.querySelectorAll('tr')[selected_id-1]

        const newData = {
            user_id: selected_row.querySelectorAll('td')[1].innerText,
            allowed_ip: selected_row.querySelectorAll('td')[2].querySelector('input').value,
            role: selected_row.querySelectorAll('td')[3].querySelector('input').value,
            create_date: selected_row.querySelectorAll('td')[4].querySelector('input').value,
            creator: selected_row.querySelectorAll('td')[5].querySelector('input').value,
            last_modify: selected_row.querySelectorAll('td')[6].querySelector('input').value ,
            modifier: selected_row.querySelectorAll('td')[7].querySelector('input').value,
            comment: selected_row.querySelectorAll('td')[8].querySelector('input').value,
        }

        let newUserList = userList.filter((e)=>parseInt(e.user_id) != parseInt(newData.user_id))
        newUserList.push(newData)
        newUserList = newUserList.sort(function(a,b){
            return a.user_id < b.user_id ? -1 : a.user_id > b.user_id ? 1 : 0;
        })

        selected_row.querySelectorAll('td')[2].innerHTML = newData.allowed_ip
        selected_row.querySelectorAll('td')[3].innerHTML = newData.role
        selected_row.querySelectorAll('td')[4].innerHTML = newData.create_date
        selected_row.querySelectorAll('td')[5].innerHTML = newData.creator
        selected_row.querySelectorAll('td')[6].innerHTML = newData.last_modify
        selected_row.querySelectorAll('td')[7].innerHTML = newData.modifier
        selected_row.querySelectorAll('td')[8].innerHTML = newData.comment

        selected_row.deleteCell(-1)

        setUserList(newUserList)

    }
    const cancelUpdateEvent = () => {
        const tbody = document.querySelector('table').querySelector('tbody')
        const selected_id = document.querySelector('input[type="radio"]:checked').id.split(('-'))[1]
        const selected_row = tbody.querySelectorAll('tr')[selected_id-1]

        const newData = {
            allowed_ip: selected_row.querySelectorAll('td')[2].querySelector('input').value,
            role: selected_row.querySelectorAll('td')[3].querySelector('input').value,
            create_date: selected_row.querySelectorAll('td')[4].querySelector('input').value,
            creator: selected_row.querySelectorAll('td')[5].querySelector('input').value,
            last_modify: selected_row.querySelectorAll('td')[6].querySelector('input').value ,
            modifier: selected_row.querySelectorAll('td')[7].querySelector('input').value,
            comment: selected_row.querySelectorAll('td')[8].querySelector('input').value,
        }

        selected_row.querySelectorAll('td')[2].innerHTML = newData.allowed_ip
        selected_row.querySelectorAll('td')[3].innerHTML = newData.role
        selected_row.querySelectorAll('td')[4].innerHTML = newData.create_date
        selected_row.querySelectorAll('td')[5].innerHTML = newData.creator
        selected_row.querySelectorAll('td')[6].innerHTML = newData.last_modify
        selected_row.querySelectorAll('td')[7].innerHTML = newData.modifier
        selected_row.querySelectorAll('td')[8].innerHTML = newData.comment

        selected_row.deleteCell(-1)

    }
    const updateUserEvent = () =>{
        //1. 선택된 사용자 index를 가져온다. -> 라디오박스 중 선택된 라디오박스 정보 얻기
        if(document.querySelector('input[type="radio"]:checked') != null ){
            const selected_id = document.querySelector('input[type="radio"]:checked').id.split(('-'))[1]
            const table = document.querySelector('table')
            const tbody = table.querySelector('tbody')
            const selected_row = tbody.querySelectorAll('tr')[selected_id-1]
            //2-1. 기존 값을 저장한다.
            const oldData = {
                user_id: parseInt(selected_row.querySelectorAll('td')[1].innerText),
                allowed_ip: selected_row.querySelectorAll('td')[2].innerText,
                role: selected_row.querySelectorAll('td')[3].innerText,
                create_date: selected_row.querySelectorAll('td')[4].innerText,
                creator: selected_row.querySelectorAll('td')[5].innerText,
                last_modify: selected_row.querySelectorAll('td')[6].innerText ,
                modifier: selected_row.querySelectorAll('td')[7].innerText,
                comment: selected_row.querySelectorAll('td')[8].innerText,
            }

            //2-2. 기존 테이블에서 선택된 행을 제거하고 입력가능한 행을 추가한다.

            selected_row.querySelectorAll('td')[2].innerHTML = `<input value="${oldData.allowed_ip}"/>`
            selected_row.querySelectorAll('td')[3].innerHTML = `<input value="${oldData.role}"/>`
            selected_row.querySelectorAll('td')[4].innerHTML = `<input value="${oldData.create_date}"/>`
            selected_row.querySelectorAll('td')[5].innerHTML = `<input value="${oldData.creator}"/>`
            selected_row.querySelectorAll('td')[6].innerHTML = `<input value="${oldData.last_modify}"/>`
            selected_row.querySelectorAll('td')[7].innerHTML = `<input value="${oldData.modifier}"/>`
            selected_row.querySelectorAll('td')[8].innerHTML = `<input value="${oldData.comment}"/>`
            const cell_button = selected_row.insertCell()
            cell_button.innerHTML = `<button>수정</button><button>취소</button>`

            //3. 수정 -> 기존 userList 를 업데이트 하고 다시 그려야 한다. 이 부분은 useEffect 가 실행되면서 자동으로 될 듯
            //4. 취소 -> 기존 userList 를 사용하여 다시 그려야 함 -> 어떻게 다시 그리지?
            cell_button.getElementsByTagName('button')[0].addEventListener('click', updateUserList)
            //number 가 +1 되서 이 부분 고쳐야됨
            cell_button.getElementsByTagName('button')[1].addEventListener('click', cancelUpdateEvent)
        }else {
            alert('편집할 사용자를 선택해주세요.')
        }
    }

    const showUserTable = () => {
        let trs = []
        const max = Math.ceil(userList.length/10) - 1
        const startNumber = max < pageIndex ? 0 : pageIndex * 10
        if(pageIndex == max || max < pageIndex){
            for(let i = startNumber; i < userList.length; i++){
                trs.push(
                    <tr key={'data-table-tr-'+i}>
                        <th><input type={'radio'} id={'id-'+userList[i].user_id} name={'data-table-cell'} /><label htmlFor={'id-'+userList[i].user_id}></label></th>
                        <td>{i+1}</td>
                        <td>{userList[i].user_id}</td>
                        <td>{userList[i].allowed_ip}</td>
                        <td>{userList[i].role}</td>
                        <td>{userList[i].create_date}</td>
                        <td>{userList[i].creator}</td>
                        <td>{userList[i].last_modify}</td>
                        <td>{userList[i].modifier}</td>
                        <td>{userList[i].comment}</td>
                    </tr>
                )
            }
        }else {
            for(let i = startNumber; i < startNumber + 10; i++){
                trs.push(
                    <tr key={'data-table-tr-'+i}>
                        <th><input type={'radio'} id={'id-'+userList[i].user_id} name={'data-table-cell'} /><label htmlFor={'id-'+userList[i].user_id}></label></th>
                        <td>{i+1}</td>
                        <td>{userList[i].user_id}</td>
                        <td>{userList[i].allowed_ip}</td>
                        <td>{userList[i].role}</td>
                        <td>{userList[i].create_date}</td>
                        <td>{userList[i].creator}</td>
                        <td>{userList[i].last_modify}</td>
                        <td>{userList[i].modifier}</td>
                        <td>{userList[i].comment}</td>
                    </tr>
                )

            }
        }

        return trs
    }

    return (
        <>
            <div className={'title-option'}>
                <h3>사용자 설정</h3>
                <div className={'option-button-group'}>
                    <button className={'option-button'} onClick={createUserEvent}>사용자 추가</button>
                    <button className={'option-button'} onClick={updateUserEvent}>사용자 편집</button>
                </div>

            </div>
            <Container width={'1570px'} height={'765px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                <div className={'content-list-table'}>
                    <table>
                        <thead>
                        <tr>
                            <th></th>
                            <th>번호</th>
                            <th>ID</th>
                            <th>허용 IP</th>
                            <th>Role</th>
                            <th>등록일시</th>
                            <th>등록자</th>
                            <th>마지막 수정날짜</th>
                            <th>수정자</th>
                            <th>기타</th>
                        </tr>
                        </thead>
                        <tbody>
                            {userList.length>0 ? showUserTable() : null}
                        </tbody>
                    </table>
                    <div>
                        {createIndex()}
                    </div>
                </div>

            </Container>

            <style jsx>{`
              h4, h3{
                color: #707070;
              }
              .title-option{
                display: flex;
              }
              .option-button{
                margin-left: 4px;
              }
              .option-button-group{
                display: flex;
                margin-left: auto;
              }
              .setting-view {
                width: 99%;
                height: 560px;
                box-shadow: 2px 2px .1px #DADBDE inset;
                padding: 10px;
                display: flex;
              }
              table {
                text-align: center;
                font-size: 14px;
                color: #707070;
              }
              th {
                border-bottom: 1px solid #EBEBEB;
                border-right: 1px solid #EBEBEB;
                background-color: #F7F9FC;
                height: 20px;
              }

              td:not(:last-child) {
                border-right: 1px solid #EBEBEB;
              }

              td {
                height: 20px;
                border-bottom: 1px solid #EBEBEB;
              }
              .content-list-table{
                width: 100%;
                height: 80%;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default UserConfig;
