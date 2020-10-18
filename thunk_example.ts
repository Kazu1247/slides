@thunk/hoge

const fetchMembersProperty = ({ hoge }: Props) => {
  return async (dispatch: Dispatch) => {

    // loading: true なる
    dispatch(fetchMembers());

    const members = await api.listMembersProperty({ hoge }).catch(() => {});

    // 取得した members を actionCreator 引き渡す
    return dispatch(setMembers(members as IMember[]));
  };
};

export default fetchMembersProperty;
