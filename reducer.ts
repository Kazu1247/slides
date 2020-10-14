@reducer/hoge

const membersReducer = (state = hogeState, action: MembersAction) => {
  switch (action.type) {
    case FETCH_MEMBERS: {
      return {
        ...state,
        isFetching: true
      };
    }

    case SET_MEMBERS: {
      return {
        ...state,
        isFetching: false,
        members: action.payload
      };
    }