class TeamContainer extends Component<Props, State> {
  componentDidMount = async () => {
    const team: Team = await api
      .showTeam({
        teamId: teamId
      })
      .then((data) => {
        return data;
      });
    this.setState({ team });
  };

  render = () => {
    return (
      <>
        <Component state={team}></Component>
      </>
    );
  };
}
