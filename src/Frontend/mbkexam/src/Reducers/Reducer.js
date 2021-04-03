
const initialState = {
  student_authenticated: false,
  admin_authenticated: false,

}
const Reducer = (state = initialState, action) => {
  let newState = Object.assign({}, state);
  switch (action.type) {
    // Para Authentication related actions
    case 'student_login':
      newState.student_authenticated = true
      return newState
      break
    case 'student_logout':
      newState.student_authenticated = false
      localStorage.clear()
      return newState
      break;
    // Admin Authentication related actions
    case 'admin_login':
      newState.admin_authenticated = true
      return newState
      break;
    case 'admin_logout':
      newState.admin_authenticated = false
      localStorage.clear()
      return newState
      break;
    case 'user_logout':
      newState.admin_authenticated = false
      newState.student_authenticated = false
      localStorage.clear()
      return newState
      break;
    default:
      return newState;

  }

}
export default Reducer;