import { Navigate } from 'react-router-dom';

// Sign-up is unified inside /login under the "สมัครสมาชิก" tab.
const Register = () => <Navigate to="/login" replace />;

export default Register;
