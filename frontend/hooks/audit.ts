import { sp } from "@pnp/sp";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../react-query/constants";
import { useContext } from "react";
import { AuthContext } from "../context";
import * as React from "react";

async function fetchAudit() {
  const data = sp.web.lists
    .getByTitle(`Audit`)
    .items.getAll()
    .then((res) => {
      return res;
    });
  return data;
}

async function fetchSingleAudit(email) {
  const data = sp.web.lists
    .getByTitle(`Audit`)
    .items.filter(`Email eq '${email}'`)
    .get()
    .then((res) => {
      return res;
    });
  return data;
}

async function createAudit(formData) {
  const data = sp.web.lists
    .getByTitle("Audit")
    .items.add(formData)
    .then((res) => {
      return res;
    });
  return data;
}

async function updateAudit(formData) {
  const data = sp.web.lists
    .getByTitle("Audit")
    .items.getById(formData["ID"])
    .update(formData)
    .then((res) => {
      return res;
    });
  return data;
}

async function deleteAudit(formData) {
  const data = sp.web.lists
    .getByTitle("Audit")
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
          .getByTitle("Audit")
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
          .getByTitle("Audit")
          .items.add(formData);
        return await response;
      } catch (err) {
        return err;
      }
    })
  );

  return await result;
}

export function useAudit() {
  const fallback = [];
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.audit],
    queryFn: fetchAudit,
  });
  return data;
}

export function useSingleAudit() {
  const { user } = React.useContext(AuthContext);
  const fallback = [];
  const { data = fallback } = useQuery({
    queryKey: [queryKeys.audit, user?.Email],
    queryFn: () => fetchSingleAudit(user?.Email),
  });
  return data;
}

export function useAddAudit() {
  const queryClient = useQueryClient();
  const { mutate, isError, error, reset, isSuccess } = useMutation({
    mutationFn: (formData) => createAudit(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.audit]);
    },
  });
  return { mutate, isError, error, reset, isSuccess };
}
export function useDeleteAudit() {
  const queryClient = useQueryClient();
  const { mutate, isError, error, reset, isSuccess } = useMutation({
    mutationFn: (formData) => deleteAudit(formData),

    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.audit]);
    },
  });
  return { mutate, isError, error, reset, isSuccess };
}

export function useUpdateAudit() {
  const queryClient = useQueryClient();
  const { mutate, isError, error, reset, isSuccess } = useMutation({
    mutationFn: (formData) => updateAudit(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.audit]);
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
      queryClient.invalidateQueries([queryKeys.audit]);
    },
    onError: (error) => {},
  });
  return { mutate, data, isSuccess, reset, isError, error };
}

export function useDeleteBulkAudit() {
  const queryClient = useQueryClient();
  const { mutate, data, isSuccess, reset, isError, error } = useMutation({
    mutationFn: (excelData) => deleteBulk(excelData),

    onSuccess: (data) => {
      queryClient.invalidateQueries([queryKeys.audit]);
    },
    onError: (error) => {},
  });
  return { mutate, data, isSuccess, reset, isError, error };
}
