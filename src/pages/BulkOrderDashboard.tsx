import { FC, useEffect, useState, useCallback, useRef } from "react";
import api from "../utils/axios";
import LoaderModal from "../components/LoaderModal";
import { Search, X } from "lucide-react";
import Pagination from "../components/Pagination";
import { Button } from "@/components/ui/button";
import { Box, Modal, Typography, IconButton } from "@mui/material";
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

interface BulkOrder {
  id: number;
  name: string;
  email: string;
  phone: string;
  deliveryStation: string;
  orderDetails: string;
  quantity: number;
  createdAt: string;
  updatedAt?: string | null;
}

const BulkOrdersDashboard: FC = () => {
  const [listData, setListData] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BulkOrder | null>(null);
  const [idFilter, setIdFilter] = useState("");
  const [idInput, setIdInput] = useState("");
  const [page, setPage] = useState({
    current_page: 1,
    to: 0,
    total: 0,
    from: 0,
    per_page: 10,
    remainingPages: 0,
    last_page: 0,
  });

  const idInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = useRef<"id" | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpenDetailsModal = async (id: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/bulk-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrder(res.data);
      setOpen(true);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOrder(null);
    setOpen(false);
  };

  const getData = async (
    pageNumber = 1,
    pageSize = 10,
    filters = { id: "" }
  ) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: (pageNumber - 1).toString(),
        size: pageSize.toString(),
      });
      if (filters.id) queryParams.append("id", filters.id);

      const token = localStorage.getItem("token");
      const res = await api.get(`/bulk-orders?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle both paginated and non-paginated responses
      const data = res.data.content || res.data;
      setListData(Array.isArray(data) ? data : []);

      // Update pagination if response is paginated
      if (res.data.pageable) {
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
      } else {
        // Non-paginated response: assume single page
        setPage((prev) => ({
          ...prev,
          current_page: 1,
          from: 1,
          to: data.length,
          total: data.length,
          per_page: data.length,
          remainingPages: 0,
          last_page: 1,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch bulk orders:", error);
      setListData([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedIdFilter = useCallback(
    debounce((value: string) => {
      setIdFilter(value);
      setPage((prev) => ({ ...prev, current_page: 1 }));
      getData(1, page.per_page, { id: value });
    }, 300),
    [page.per_page]
  );

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdInput(value);
    activeInputRef.current = "id";
    debouncedIdFilter(value);
  };

  useEffect(() => {
    if (activeInputRef.current === "id" && idInputRef.current) {
      idInputRef.current.focus();
      const length = idInputRef.current.value.length;
      idInputRef.current.setSelectionRange(length, length);
    }
  }, [listData, page]);

  useEffect(() => {
    getData(page.current_page, page.per_page, { id: idFilter });
  }, []);

  const handlePageClick = (e: any) => {
    if (!loading) {
      const newPage = e.selected + 1;
      if (newPage !== page.current_page) {
        setPage((prev) => ({ ...prev, current_page: newPage }));
        getData(newPage, page.per_page, { id: idFilter });
      }
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (newSize !== page.per_page) {
      setPage((prev) => ({ ...prev, per_page: newSize, current_page: 1 }));
      getData(1, newSize, { id: idFilter });
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
                    id="idFilter"
                    ref={idInputRef}
                    className="w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-3xl outline-none"
                    placeholder="Order ID"
                    value={idInput}
                    onChange={handleIdChange}
                    onFocus={() => (activeInputRef.current = "id")}
                  />
                </div>
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
                    {listData.map((item: BulkOrder, index) => (
                      <div
                        key={item.id}
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
                            <p className="text-xs text-gray-500">Order ID</p>
                            <p className="font-medium text-sm">{item.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="font-medium text-sm">{item.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Delivery Station</p>
                            <p className="font-medium text-sm">{item.deliveryStation}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Order Details</p>
                            <p className="font-medium text-sm">{item.orderDetails}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Quantity</p>
                            <p className="font-medium text-sm">{item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDetailsModal(item.id)}
                            className="h-8 px-2"
                          >
                            View Details
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
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Order ID</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Name</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Email</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Phone</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Delivery Station</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Order Details</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Quantity</th>
                        <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">Created At</th>
                        <th className="px-2 text-sm py-3 text-center font-medium text-black tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listData.map((item: BulkOrder, index) => (
                        <tr key={item.id} className="text-center bg-white shadow-md text-sm">
                          <td className="px-2 py-4 font-medium text-black rounded-tl-lg rounded-bl-lg">
                            {(page.current_page - 1) * page.per_page + index + 1}
                          </td>
                          <td className="px-2 py-4 font-medium text-black">{item.id}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.name}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.email}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.phone}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.deliveryStation}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.orderDetails}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.quantity}</td>
                          <td className="px-2 py-4 font-medium text-black">{item.createdAt}</td>
                          <td className="px-2 py-4 font-medium rounded-tr-lg rounded-br-lg">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDetailsModal(item.id)}
                              className="p-2"
                            >
                              View Details
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
                <h2 className="text-xl font-semibold mb-4">No Bulk Orders Found</h2>
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
                Bulk Order Details
              </Typography>
              {selectedOrder && (
                <Box>
                  <Typography><strong>ID:</strong> {selectedOrder.id}</Typography>
                  <Typography><strong>Name:</strong> {selectedOrder.name}</Typography>
                  <Typography><strong>Email:</strong> {selectedOrder.email}</Typography>
                  <Typography><strong>Phone:</strong> {selectedOrder.phone}</Typography>
                  <Typography><strong>Delivery Station:</strong> {selectedOrder.deliveryStation}</Typography>
                  <Typography><strong>Order Details:</strong> {selectedOrder.orderDetails}</Typography>
                  <Typography><strong>Quantity:</strong> {selectedOrder.quantity}</Typography>
                  <Typography><strong>Created At:</strong> {selectedOrder.createdAt}</Typography>
                  <Typography><strong>Updated At:</strong> {selectedOrder.updatedAt || "N/A"}</Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                <Button className="bg-gray-600" onClick={handleClose}>
                  Close
                </Button>
              </Box>
            </Box>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default BulkOrdersDashboard