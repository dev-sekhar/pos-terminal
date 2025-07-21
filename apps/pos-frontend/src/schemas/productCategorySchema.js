import * as Yup from 'yup';

const productCategorySchema = Yup.object().shape({
  name: Yup.string().required('Category name is required'),
  description: Yup.string(),
  userName: Yup.string().required('User Name is required'),
  active: Yup.boolean(),
});

export default productCategorySchema; 