export const fetchMembers = () => ({
  type: FETCH_MEMBERS
});

export const setMembers = (members: hoge[]) => ({
  type: SET_MEMBERS,
  payload: members
});
