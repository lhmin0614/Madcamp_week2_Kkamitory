import React, {Component} from 'react';
import Modal from 'react-modal';
import PostItem from './PostItem.js'
import PostForm from './PostForm.js'
import axios from "axios";
import './Posts.css'

class Posts extends Component {
    constructor(props){
        super(props);
        this.state = {
            isModalOpen : false, //flag for modal window
            boards: [        //important list which contains core data of posts
                {
                    _id: 1,
                    brdwriter: 'Lee SunSin',
                    brdtitle: 'If you intend to live then you die',
                    hashtag: '#hashtag1 #hashtag2',
                    brddate: new Date(),
                    brdcontent : "content example1"
                },
                {
                    _id: 2,
                    brdwriter: 'So SiNo',
                    brdtitle: 'Founder for two countries',
                    hashtag : '#hashtag1 #hashtag3',
                    brddate: new Date(),
                    brdcontent : "content example2"
                }
            ],
            selectedBoard:{},  //selected board contains one or zero board content to rewrite/remove
            nickname: 0,
            profile: "",
        }
    }
    //첫로딩
    componentDidMount() {
        //db에서 getAll
        axios.get(`/api/post/`)
        .then(response => {
            this.setState({boards: [...response.data]})
        });

        const GetUser = this;

        window.Kakao.API.request({
            url: "/v2/user/me",
            success: function ({ kakao_account }) {
              const { profile } = kakao_account;
              // 수집한 사용자 정보로 페이지를 수정하기 위해 setState
              GetUser.setState({
                nickname: profile.nickname,
                profile: profile.profile_image_url,
              });
              //console.log(GetUser.state.profile_image_url);
            },
            fail: function (error) {
              console.log(error);
            },
          });
    }

    openModal = () => {
        this.setState({ isModalOpen: true });
      };
    
    closeModal = () => {
        this.setState({ isModalOpen: false });
      };
    
    handleSaveData = (data) => {
        if (!data._id) {            // new : Insert
            axios.post(`/api/post/add`, 
                {brddate: new Date(), ...data, profile: this.state.profile, brdwriter: this.state.nickname}
            )
            .then(() => axios.get(`/api/post/`))
            .then(response => {
                this.setState({
                    selectedBoard: {},
                    boards: [...response.data]
                })
                console.log(this.state.boards);
            });

        } else {                                                        // Update

            axios.post(`/api/post/update`, {
                brddate: new Date(), ...data, profile: this.state.profile
            })
            .then(() => axios.get(`/api/post/`))
            .then(response => {
                this.setState({
                    selectedBoard: {},
                    boards: [...response.data]
                })
            });
            /*
            this.setState({
                boards: this.state.boards.map(row => data._id.equals(row._id)  ? {...data }: row),
                selectedBoard: {}
            })         */   
        }

        this.closeModal();
    }

    onBackButtonClicked = () => {
        this.closeModal();
    }
    
    handleRemove = (_id) => {
        axios.post(`/api/post/remove`, {_id: _id})
        .then(() => axios.get(`/api/post/`))
        .then(response => {
            this.setState({
                selectedBoard: {},
                boards: [...response.data]
            })
        });
    }
    
    handleSelectRow = (row) => {
        this.setState({selectedBoard:row});
    }


    
    render() {
            const { boards , selectedBoard } = this.state;

            
            return (
                <div>
                    <div className = "modal_btn_wraper">
                        <button onClick={this.openModal} className = "plus_btn"><img className = "plus_btn_img" src = "/img/addBtn.png"></img></button>
                    </div>
                    <div className = "modal_wraper">
                        <Modal isOpen={this.state.isModalOpen} close={this.closeModal} >
                            <PostForm selectedBoard = {selectedBoard} onSaveData={this.handleSaveData} onBackButtonClicked={this.onBackButtonClicked}/>
                        </Modal>
                        </div>
                    <h3 className= "page_title">
                        <img className = "main_img" src= "/img/house.png"></img>
                        <em className="main_text">
                            자유게시판
                        </em>
                        <span className="detail_text">
                            가장 빠른 기숙사 새소식 업데이트
                        </span>
                    </h3> 
                    
                    <ul id = "postsList">
                    { 
                                boards.map(row => 
                                    (<PostItem key={row._id} row={row} onRemove={this.handleRemove} onSelectRow={this.handleSelectRow}/>) 
                                )
                            } 
                    </ul>
                </div>
            );
        }
}
export default Posts;
