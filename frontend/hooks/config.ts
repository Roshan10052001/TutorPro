import { sp } from "@pnp/sp";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../react-query/constants";
import { useContext } from "react";
import { AuthContext } from "../context";
import * as React from "react";

async function fetchAdmin() {
  const data = sp.web.lists
    .getByTitle(`Administrator`)
    .items.getAll()
    .then((res) => {
      return res;
    });
  return data;
}

async function fetchSingleAdmin(email) {
  const data = sp.web.lists
    .getByTitle(`Administrator`)
    .items.filter(`Email eq '${email}'`)
    .get()
    .then((res) => {
      return res;
    });
  return data;
}

async function createAdmin(formData) {
  const data = sp.web.lists
    .getByTitle("Administrator")
    .items.add(formData)
    .then((res) => {
      return res;
    });
  return data;
}

async function updateAdmin(formData) {
  const data = sp.web.lists
    .getByTitle("Administrator")
    .items.getById(formData["ID"])
    .update(formData)
    .then((res) => {
      return res;
    });
  return data;
}

async function deleteAdmin(formData) {
  const data = sp.web.lists
    .getByTitle("Administrator")
    .items.getById(formData)
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
          .getByTitle("Administrator")
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
          .getByTitle("Administrator")
          .items.add(formData);
        return await response;
      } catch (err) {
        return err;
      }
    })
  );

  return await result;
}

export function useAdmin() {
  const fallback = [];
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.admin],
    queryFn: fetchAdmin,
  });
  return data;
}

export function useSingleAdmin() {
  const { user } = React.useContext(AuthContext);
  const fallback = [];
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.admin, user?.Email],
    queryFn: () => fetchSingleAdmin(user?.Email),
  });
  return data;
}

export function useAddAdmin() {
  const queryClient = useQueryClient();
  const { mutate, isError, error, reset, isSuccess } = useMutation({
    mutationFn: (formData) => createAdmin(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.admin]);
    },
  });
  return { mutate, isError, error, reset, isSuccess };
}
export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  const { mutate, isError, error, reset, isSuccess } = useMutation({
    mutationFn: (formData) => deleteAdmin(formData),

    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.admin]);
    },
  });
  return { mutate, isError, error, reset, isSuccess };
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  const { mutate, isError, error, reset, isSuccess } = useMutation({
    mutationFn: (formData) => updateAdmin(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.admin]);
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
      queryClient.invalidateQueries([queryKeys.admin]);
    },
    onError: (error) => {},
  });
  return { mutate, data, isSuccess, reset, isError, error };
}

export function useDeleteBulkAdmin() {
  const queryClient = useQueryClient();
  const { mutate, data, isSuccess, reset, isError, error } = useMutation({
    mutationFn: (excelData) => deleteBulk(excelData),

    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.admin]);
    },
    onError: (error) => {},
  });
  return { mutate, data, isSuccess, reset, isError, error };
}
