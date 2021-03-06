import axios from 'axios';
import { auth, createLogin } from '../testSetup';

let user;
let memberUser;
let team;

describe('Team and direct message resolvers', () => {
    beforeAll(async () => {
        user = await createLogin('teamTest');
    });

    test('CreateTeam', async () => {
        const { token, refreshToken } = await auth(user);

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                mutation {
                    createTeam(name: "test team", description: "test description") {
                        success
                        team {
                            id
                            name
                            description
                        }
                        errors {
                            path
                            message
                        }
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        team = data.data.createTeam.team;
        expect(data).toMatchObject({
            'data': {
                'createTeam': {
                    'success': true,
                    'team': {
                        'id': expect.any(Number),
                        'name': 'test team',
                        'description': 'test description'
                    },
                    'errors': null,
                },
            }
        });
    });

    test('GetUsersByTeam', async () => {
        const { token, refreshToken } = await auth(user);

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                query {
                    getTeamUsers(teamId: ${team.id}) {
                        id
                        username
                        email
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        expect(data).toMatchObject({
            'data': {
                'getTeamUsers': [
                    {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                    },
                ]
            }
        });
    });

    test('GetTeam', async () => {
        const { token, refreshToken } = await auth(user);

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                query {
                    getTeam(teamId: ${team.id}) {
                        id
                        name
                        description
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        expect(data).toMatchObject({
            'data': {
                'getTeam': {
                    'id': team.id,
                    'name': team.name,
                    'description': team.description,
                },
            }
        });
    });

    test('EditTeam', async () => {
        const { token, refreshToken } = await auth(user);

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                mutation {
                    editTeam(teamId: ${team.id}, teamName: "edited team name", description: "edited team description") {
                        success
                        errors {
                            path
                            message
                        }
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        expect(data).toMatchObject({
            'data': {
                'editTeam': {
                    'success': true,
                    'errors': null,
                },
            }
        });
    });

    test('AddTeamMember', async () => {
        const { token, refreshToken } = await auth(user);

        memberUser = await createLogin('MemberTest');

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                mutation {
                    addTeamMember(teamId: ${team.id}, email: "${memberUser.email}") {
                        success
                        user {
                            id
                            username
                            email
                        }
                        errors {
                            path
                            message
                        }
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        expect(data).toMatchObject({
            'data': {
                'addTeamMember': {
                    'success': true,
                    'user': {
                        'id': memberUser.id,
                        'username': memberUser.username,
                        'email': memberUser.email,
                    },
                    'errors': null,
                },
            }
        });
    });

    test('Create Direct Message', async () => {
        const { token, refreshToken } = await auth(user);

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                mutation {
                    createDirectMessage(teamId: ${team.id}, receiverId: ${memberUser.id}, text: "test direct message") {
                        success
                        errors {
                            path
                            message
                        }
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        expect(data).toMatchObject({
            'data': {
                'createDirectMessage': {
                    'success': true,
                    'errors': null,
                },
            }
        });
    });

    test('Get Direct Messages', async () => {
        const { token, refreshToken } = await auth(user);

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                query {
                    getDirectMessages(teamId: ${team.id}, receiverId: ${memberUser.id}) {
                        id
                        text
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        expect(data).toMatchObject({
            'data': {
                'getDirectMessages': [{
                    'id': 1,
                    'text': 'test direct message',
                }]
            }
        });
    });

    test('Delete Direct Message', async () => {
        const { token, refreshToken } = await auth(user);

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                mutation {
                    deleteDirectMessage(messageId: 1) {
                        success
                        errors {
                            path
                            message
                        }
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        expect(data).toMatchObject({
            'data': {
                'deleteDirectMessage': {
                    'success': true,
                    'errors': null,
                },
            }
        });
    });

    test('LeaveTeam', async () => {
        const { token, refreshToken } = await auth(memberUser);

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                mutation {
                    leaveTeam(teamId: ${team.id}) {
                        success
                        errors {
                            path
                            message
                        }
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        expect(data).toMatchObject({
            'data': {
                'leaveTeam': {
                    'success': true,
                    'errors': null,
                },
            }
        });
    });

    test('DeleteTeam', async () => {
        const { token, refreshToken } = await auth(user);

        const resp = await axios.post('http://localhost:8080/graphql',
            {
                query: `
                mutation {
                    deleteTeam(teamId: ${team.id}) {
                        success
                        errors {
                            path
                            message
                        }
                    }
                }
            `,
            },
            {
                headers: {
                    'x-token': token,
                    'x-refresh-token': refreshToken,
                },
            }
        );

        const { data } = resp;
        expect(data).toMatchObject({
            'data': {
                'deleteTeam': {
                    'success': true,
                    'errors': null,
                },
            }
        });
    });
});