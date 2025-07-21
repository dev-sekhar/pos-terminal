import * as Yup from "yup";

const branchSchema = Yup.object().shape({
  tag: Yup.string().required("Branch name is required"),
  userName: Yup.string().required("User Name is required"),
  active: Yup.boolean(),
});

export default branchSchema;
