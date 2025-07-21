import * as Yup from 'yup';

const supplierSchema = Yup.object().shape({
  name: Yup.string().required('Supplier name is required'),
  contact: Yup.string(),
  email: Yup.string().email('Invalid email'),
  address: Yup.string(),
  userName: Yup.string().required('User Name is required'),
  active: Yup.boolean(),
});

export default supplierSchema; 