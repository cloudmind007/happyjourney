import { FC, useEffect, useState, useCallback, useRef } from "react";
import api from "../utils/axios";
import LoaderModal from "../components/LoaderModal";
import { Search, X } from "lucide-react";
import Pagination from "../components/Pagination";
import { Button } from "@/components/ui/button";
import { Box, Modal, Typography, IconButton, Select, MenuItem } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import debounce from "lodash.debounce";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  bgcolor: "background.paper",
  borderRadius: 2,
  p: 4,
};

interface Callback {
  callbackId: number;
  name: string;
  email: string | null;
  mobileNumber: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

const CallbacksDashboard: FC = () => {
  const [listData, setListData] = useState<Callback[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [page, setPage] = useState({
    current_page: 1,
    to: 0,
    total: 0,
    from: 0,
    per_page: 10,
    remainingPages: 0,
    last_page: 0,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = useRef<"name" | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpenStatusModal = (id: number, currentStatus: string) => {
    setSelectedId(id);
    setSelectedStatus(currentStatus);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedId(null);
    setSelectedStatus("");
    setOpen(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedId || !selectedStatus) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/callbacks/${selectedId}/status`,
        { status: selectedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefresh(!refresh);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const getData = async (
    pageNumber = 1,
    pageSize = 10,
    filters = { name: "", status: "" }
  ) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: (pageNumber - 1).toString(),
        size: pageSize.toString(),
      });
      if (filters.name) queryParams.append("name", filters.name);
      if (filters.status) queryParams.append("status", filters.status);

      const token = localStorage.getItem("token");
      const res = await api.get(`/callbacks?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setListData(res.data.content || []);

      const { pageable, numberOfElements, totalElements, totalPages } = res.data;
      setPage((prev) => {
        const newPage = {
          current_page: pageNumber,
          from: pageable.offset + 1,
          to: pageable.offset + numberOfElements,
          total: totalElements,
          per_page: pageable.pageSize,
          remainingPages: totalPages - pageNumber,
          last_page: totalPages,
        };
        if (
          prev.current_page === newPage.current_page &&
          prev.per_page === newPage.per_page &&
          prev.total === newPage.total &&
          prev.last_page === newPage.last_page &&
          prev.from === newPage.from &&
          prev.to === newPage.to &&
          prev.remainingPages === newPage.remainingPages
        ) {
          return prev;
        }
        return newPage;
      });
    } catch (error) {
      console.error("Failed to fetch callbacks:", error);
      setListData([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedNameFilter = useCallback(
    debounce((value: string) => {
      setNameFilter(value);
      setPage((prev) => ({ ...prev, current_page: 1 }));
      getData(1, page.per_page, { name: value, status: statusFilter });
    }, 300),
    [statusFilter, page.per_page]
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameInput(value);
    activeInputRef.current = "name";
    debouncedNameFilter(value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    setPage((prev) => ({ ...prev, current_page: 1 }));
    getData(1, page.per_page, { name: nameFilter, status: value });
  };

  useEffect(() => {
    if (activeInputRef.current === "name" && nameInputRef.current) {
      nameInputRef.current.focus();
      const length = nameInputRef.current.value.length;
      nameInputRef.current.setSelectionRange(length, length);
    }
  }, [listData, page]);

  useEffect(() => {
    getData(page.current_page, page.per_page, { name: nameFilter, status: statusFilter });
  }, [refresh]);

  const handlePageClick = (e: any) => {
    if (!loading) {
      const newPage = e.selected + 1;
      if (newPage !== page.current_page) {
        setPage((prev) => ({ ...prev, current_page: newPage }));
        getData(newPage, page.per_page, { name: nameFilter, status: statusFilter });
      }
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (newSize !== page.per_page) {
      setPage((prev) => ({ ...prev, per_page: newSize, current_page: 1 }));
      getData(1, newSize, { name: nameFilter, status: statusFilter });
    }
  };

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <LoaderModal />
      ) : (
        <div className="h-full w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-4 py-4 gap-4 sm:gap-0 sm:py-0 sm:h-16">
            <div className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full">
                <div className="relative w-full sm:w-48">
                  <div className="absolute inset-y-0 left-1 flex items-center ps-3 pointer-events-none">
                    <Search className="size-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="nameFilter"
                    ref={nameInputRef}
                    className="w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-3xl outline-none"
                    placeholder="Name"
                    value={nameInput}
                    onChange={handleNameChange}
                    onFocus={() => (activeInputRef.current = "name")}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-auto"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                <select
                  value={page.per_page}
                  onChange={handlePageSizeChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-auto"
                >
                  <option value={10}>10 Records</option>
                  <option value={25}>25 Records</option>
                  <option value={50}>50 Records</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-3">
            {listData.length > 0 ? (
              <div className="p-4 bg-white overflow-x-auto">
                {isMobile ? (
                  <div className="space-y-4">
                    {listData.map((item: Callback, index) => (
                      <div
                        key={item.callbackId}
                        className="p-4 bg-white shadow-md rounded-lg border border-gray-100"
                      >
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Sr. No.</p>
                            <p className="font-medium text-sm">
                              {(page.current_page - 1) * page.per_page + index + 1}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Callback ID</p>
                            <p className="font-medium text-sm">{item.callbackId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="font-medium text-sm">{item.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-sm">{item.email || "N/A"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Message</p>
                            <p className="font-medium text-sm">{item.message}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <p className="font-medium text-sm">{item.status}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenStatusModal(item.callbackId, item.status)}
                            className="h-8 px-2"
                          >
                            Update Status
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead className="w-full">
                      <tr className="rounded-md w-full text-center py-4">
                        <th className="px-2 text-sm py-3 font-medium text-black">Sr. No.</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Callback ID</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Name</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Email</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Mobile</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Message</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Status</th>
                        <th className="px-2 text-sm py-3 text-center font-medium text-black tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listData.map((item: Callback, index) => (
                        <tr key={item.callbackId} className="text-center bg-white shadow-md text-sm">
                          <td className="px-2 py-4 font-medium text-black rounded-tl-lg rounded-bl-lg">
                            {(page.current_page - 1) * page.per_page + index + 1}
                          </td>
                          <td className="px-2 py-4 font-medium text-black">{item.callbackId}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.name}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.email || "N/A"}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.mobileNumber || "N/A"}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.message}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.status}</td>
                          <td className="px-2 py-4 font-medium rounded-tr-lg rounded-br-lg">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenStatusModal(item.callbackId, item.status)}
                              className="p-2"
                            >
                              Update Status
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="w-full mt-6">
                  <Pagination
                    numOfPages={page.last_page}
                    pageNo={page.current_page}
                    pageSize={page.per_page}
                    handlePageClick={handlePageClick}
                    totalItems={page.total}
                    from={page.from}
                    to={page.to}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-12">
                <h2 className="text-xl font-semibold mb-4">No Callbacks Found</h2>
              </div>
            )}
          </div>
          <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
              <IconButton
                onClick={handleClose}
                sx={{ position: "absolute", top: 8, right: 8, color: "grey.500" }}
              >
                <X />
              </IconButton>
              <Typography variant="h6" component="h2" mb={2} fontFamily={"Nunito"}>
                Update Callback Status
              </Typography>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                fullWidth
                sx={ { mb: 4 }}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
              </Select>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="contained" onClick={handleUpdateStatus}>
                  Update
                </Button>
                <Button className="bg-gray-600" onClick={handleClose}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default CallbacksDashboard;