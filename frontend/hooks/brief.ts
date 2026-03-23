import { sp } from "@pnp/sp";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../react-query/constants";
import { useContext } from "react";
import { AuthContext } from "../context";
import * as React from "react";
// import { axiosInstance } from "../axios-Instance";
import { errorAlert, successAlert } from "../utils";
import { Web } from '@pnp/sp/webs';

const List_Title = "GTM";
async function fetchGTM() {
  const data = sp.web.lists
    .getByTitle(List_Title)
    .items.getAll()
    .then((res) => {
      return res.map((it) => ({
        ...it,
        Owner: it?.Owner?.Title,
      }));
    });
  return data;
}

async function fetchSingleGTM(email) {
  const data = sp.web.lists
    .getByTitle(List_Title)
    .items.filter(`Email eq '${email}'`)
    .getAll()
    .then((res) => {
      return res;
    });
  return data;
}

async function createGTM(formData) {
  const data = sp.web.lists
    .getByTitle(List_Title)
    .items.add(formData)
    .then((res) => {
      return res;
    });
  return data;
}

async function updateGTM(formData) {
  const data = sp.web.lists
    .getByTitle(List_Title)
    .items.getById(formData["ID"])
    .update(formData)
    .then((res) => {
      return res;
    });
  return data;
}

async function deleteGTM(formData) {
  const data = sp.web.lists
    .getByTitle(List_Title)
    .items.getById(formData["ID"])
    .delete()
    .then((res) => {
      return res;
    });
  return data;
}
async function deleteBulk(excelData) {
  const result = await (Promise as any).allSettled(
    excelData.map(async (formData) => {
      try {
        const response = await sp.web.lists
          .getByTitle(List_Title)
          .items.getById(formData)
          .delete();
        return await response;
      } catch (err) {
        return err;
      }
    })
  );

  return await result;
}

async function BulkUpload(excelData) {
  const result = await (Promise as any).allSettled(
    excelData.map(async (formData) => {
      try {
        const response = await sp.web.lists
          .getByTitle(List_Title)
          .items.add(formData);
        return await response;
      } catch (err) {
        return err;
      }
    })
  );

  return await result;
}

export function useGTM() {
  const fallback = [];
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.form],
    queryFn: () => fetchGTM(),
  });
  return data;
}

export function useSingleGTM() {
  const { user } = React.useContext(AuthContext);
  const fallback = [];
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.form, user?.Email],
    queryFn: () => fetchSingleGTM(user?.Email),
  });
  return { data };
}

export function useAddGTM() {
  const queryClient = useQueryClient();
  const { mutate, isError, error, reset, isSuccess } = useMutation({
    mutationFn: (formData) => createGTM(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.form]);
    },
  });
  return { mutate, isError, error, reset, isSuccess };
}
export function useDeleteGTM() {
  const queryClient = useQueryClient();
  const { mutate, isError, error, reset, isSuccess } = useMutation({
    mutationFn: (formData) => deleteGTM(formData),

    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.form]);
    },
  });
  return { mutate, isError, error, reset, isSuccess };
}

export function useUpdateGTM() {
  const queryClient = useQueryClient();
  const { mutate, isError, error, reset, isSuccess } = useMutation({
    mutationFn: (formData) => updateGTM(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.form]);
    },
    onError: (error) => {},
  });
  return { mutate, isError, error, reset, isSuccess };
}

export function useBulkUpload() {
  const queryClient = useQueryClient();
  const { mutate, data, isSuccess, reset, isError, error } = useMutation({
    mutationFn: (excelData) => BulkUpload(excelData),

    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.form]);
    },
    onError: (error) => {},
  });
  return { mutate, data, isSuccess, reset, isError, error };
}

export function useDeleteBulkGTM() {
  const queryClient = useQueryClient();
  const { mutate, data, isSuccess, reset, isError, error } = useMutation({
    mutationFn: (excelData) => deleteBulk(excelData),

    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.form]);
    },
    onError: (error) => {},
  });
  return { mutate, data, isSuccess, reset, isError, error };
}

async function photoUpload(files, pageContext) {
  const { key, file } = files;
  const result = await (Promise as any).allSettled(
    file.map(async (name) => {
      try {
        const response = await sp.web
          .getFolderByServerRelativeUrl("Files")
          .files.add(name.name, name, true);

        const data = await response;
        const picture = {
          url: `${pageContext._web.absoluteUrl}/Files/${data.data.Name}`,
          name: data.data.Name,
          key,
        };

        return picture;
      } catch (err) {}
    })
  );

  return await result;
}

export function useImageUpload() {
  const { pageContext } = React.useContext(AuthContext);
  const fallback = [];
  const {
    mutate,
    data = fallback,
    isError,
    error,
    reset,
    isSuccess,
  } = useMutation({
    mutationFn: (files) => photoUpload(files, pageContext),
  });

  return { mutate, data, isError, error, reset, isSuccess };
}

// const sendSms = async (smsData) => {
//   try {
//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(smsData),
//     });
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     const data = await response.json();
//     console.log("SMS sent:", data);
//   } catch (error) {
//     console.error("Fetch error:", error);
//   }
// };


// export function useSendSMS() {
//   const queryClient = useQueryClient();
//   const { mutate, isSuccess, isError, error, reset } = useMutation({
//     mutationFn: (formData) => sendSms(formData),
//     onSuccess: () => {
//       queryClient.invalidateQueries([queryKeys.sms]);
//     },
//     onError: (err) => {
//       errorAlert(err);
//     },
//   });
//   return { mutate, isSuccess, isError, error, reset };
// }

async function fetchDivision() {
  const web = Web("https://mtncloud.sharepoint.com/sites/NG_SHARE/");
  const data = web.lists
    .getByTitle(`Divisions`)
    .items.getAll()
    .then((res) => {
      return res;
    });
  return data;
}
async function fetchDepartments() {
  const web = Web("https://mtncloud.sharepoint.com/sites/NG_SHARE/");
  const data = web.lists
    .getByTitle(`Departments`)
    .items.getAll()
    .then((res) => {
      return res;
    });
  return data;
}
export function useDivision() {
  const fallback = [];
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.division],
    queryFn: fetchDivision,
  });
  return data;
}

export function useDepartments() {
  const fallback = [];
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.department],
    queryFn: fetchDepartments,
  });
  return data;
}