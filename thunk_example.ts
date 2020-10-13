@thunk/
const fetchMembersProperty = ({ hoge }: Props) => {
  return async (dispatch: Dispatch) => {
    dispatch(fetchMembers());

    const members = await api.listMembersProperty({ hoge }).catch(() => {});

    return dispatch(setMembers(members as IMember[]));
  };
};

export default fetchMembersProperty;

-----

@reducer/
switch (action.type) {
    case FETCH_MEMBERS: {
      return {
        ...state,
        isFetching: true
      };
    }

-----


