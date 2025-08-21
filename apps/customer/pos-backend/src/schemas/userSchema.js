import * as Yup from "yup";

const userSchema = Yup.object().shape({
  name: Yup.string().required("User name is required"),
  role: Yup.string().required("Role is required"),
  branch: Yup.string().required("Branch is required"),
});

export default userSchema;
