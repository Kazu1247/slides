@reducer/hoge

const membersReducer = (state = hogeState, action: MembersAction) => {
  switch (action.type) {
    // アクションfetchMembers が発行されたら行う処理
    case FETCH_MEMBERS: {
      return {
        ...state,
        isFetching: true
      };
    }

    // アクションsetMembers が発行されたら行う処理 
    case SET_MEMBERS: {
      return {
        ...state,
        isFetching: false,
        members: action.payload
      };
    }