import { FC, useEffect, useState } from "react";
import api from "../utils/axios";
import LoaderModal from "../components/LoaderModal";
import { Edit, Eye, Plus, Search, Trash2, X, Leaf, Flame } from "lucide-react";
import Pagination from "../components/Pagination";
import { Button } from "@/components/ui/button";
import { Box, Modal, Typography, IconButton } from "@mui/material";
import AddVendorModal from "@/components/AddVender";
import { useNavigate } from "react-router-dom";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 600 },
  maxWidth: "100%",
  bgcolor: "background.paper",
  borderRadius: 2,
  p: { xs: 2, sm: 4 },
  maxHeight: "90vh",
  overflowY: "auto",
};

const Restaurant: FC = () => {
  const [listData, setListData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const navigate = useNavigate();
  const [page, setPage] = useState({
    current_page: 1,
    to: 0,
    total: 0,
    from: 0,
    per_page: 10,
    remainingPages: 0,
    last_page: 0,
  });
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  const handleOpenAddModal = () => {
    setMode("add");
    setSelectedId(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (id: number) => {
    setMode("edit");
    setSelectedId(id);
    setOpenModal(true);
  };

  const handleClose = () => {
    setSelectedId(null);
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      setLoading(true);
      const res = await api.delete(`/vendors/${selectedId}`);
      if (res.status === 204) {
        setRefresh(!refresh);
        handleClose();
        alert("Vendor deleted successfully!");
      } else {
        throw new Error(`Unexpected status code: ${res.status}`);
      }
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      alert("Failed to delete vendor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchImage = async (logoUrl: string) => {
    if (!logoUrl || imageUrls[logoUrl]) return;

    try {
      const response = await api.get(
        `/files/download?systemFileName=${logoUrl}`,
        { responseType: "blob" }
      );

      if (response.status === 200) {
        const blob = response.data;
        const url = URL.createObjectURL(blob);
        setImageUrls((prev) => ({ ...prev, [logoUrl]: url }));
      }
    } catch (error) {
      console.error(`Failed to fetch image for ${logoUrl}:`, error);
      setImageUrls((prev) => ({
        ...prev,
        [logoUrl]: "https://via.placeholder.com/80?text=No+Image",
      }));
    }
  };

  const getData = async (pageNumber = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/vendors?page=${pageNumber - 1}&size=${pageSize}`
      );

      const vendors = res.data.content || [];
      setListData(vendors);

      vendors.forEach((item: any) => {
        if (item.logoUrl) {
          fetchImage(item.logoUrl);
        }
      });

      const { pageable, numberOfElements, totalElements, totalPages } =
        res.data;

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
      console.error("Failed to fetch data:", error);
      setListData([]);
      alert("Failed to fetch vendor data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (e: any) => {
    if (!loading) {
      const newPage = e.selected + 1;
      if (newPage !== page.current_page) {
        setPage((prev) => ({ ...prev, current_page: newPage }));
        getData(newPage, page.per_page);
      }
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (newSize !== page.per_page) {
      setPage((prev) => ({ ...prev, per_page: NewSize, current_page: 1 }));
      getData(1, newSize);
    }
  };

  useEffect(() => {
    getData(page.current_page, page.per_page);
  }, [refresh, page.current_page, page.per_page]);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (!url.includes("via.placeholder.com")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {loading ? (
        <LoaderModal />
      ) : (
        <div className="h-full w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white px-4 py-4 gap-4 shadow-sm">
            <div className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-1 flex items-center ps-3 pointer-events-none">
                    <Search className="size-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="searchQuery"
                    className="w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search vendors..."
                  />
                </div>
                <select
                  value={page.per_page}
                  onChange={handlePageSizeChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 Records</option>
                  <option value={25}>25 Records</option>
                  <option value={50}>50 Records</option>
                </select>
              </div>
            </div>
            <Button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 w-full sm:w-auto shadow-md"
            >
              <Plus className="size-5" />
              Add Vendor
            </Button>
          </div>

          <div className="p-4">
            {listData.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead className="bg-gray-50">
                      <tr className="text-center text-sm font-semibold text-gray-700">
                        <th className="px-4 py-3">Sr. No.</th>
                        <th className="px-4 py-3">Logo</th>
                        <th className="px-4 py-3">Business Name</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">FSSAI License</th>
                        <th className="px-4 py-3">Veg/Non-Veg</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listData.map((item, index) => (
                        <tr
                          key={item.vendorId || index}
                          className={`text-center bg-white shadow-sm hover:bg-gray-50 transition-colors ${
                            item.veg
                              ? "shadow-[0_0_0_2px_rgba(34,197,94,0.3)]"
                              : "shadow-[0_0_0_2px_rgba(248,113,113,0.3)]"
                          }`}
                        >
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {(page.current_page - 1) * page.per_page + index + 1}
                          </td>
                          <td className="px-4 py-4">
                            {item.logoUrl && imageUrls[item.logoUrl] ? (
                              <img
                                src={imageUrls[item.logoUrl]}
                                className="w-16 h-16 mx-auto rounded-lg object-cover"
                                alt="Vendor Logo"
                              />
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {item.businessName || "-"}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.description || "-"}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {item.fssaiLicense || "-"}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex justify-center items-center gap-1">
                              {item.veg ? (
                                <Leaf className="w-5 h-5 text-green-500" />
                              ) : (
                                <Flame className="w-5 h-5 text-orange-500" />
                              )}
                              <span>{item.veg ? "Veg" : "Non-Veg"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                item.activeStatus
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-500"
                              }`}
                            >
                              {item.activeStatus ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditModal(item.vendorId)}
                                className="p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-5 h-5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/vender-detail/${item.vendorId}`)}
                                className="p-2 text-green-600 hover:bg-green-50"
                              >
                                <Eye className="w-5 h-5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedId(item.vendorId);
                                  setOpen(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4 p-4">
                  {listData.map((item, index) => (
                    <div
                      key={item.vendorId || index}
                      className={`bg-white shadow-lg rounded-xl p-4 border border-gray-100 ${
                        item.veg
                          ? "shadow-[0_0_0_2px_rgba(34,197,94,0.3)]"
                          : "shadow-[0_0_0_2px_rgba(248,113,113,0.3)]"
                      }`}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">
                            #{(page.current_page - 1) * page.per_page + index + 1}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditModal(item.vendorId)}
                              className="p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-5 h-5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/vender-detail/${item.vendorId}`)}
                              className="p-2 text-green-600 hover:bg-green-50"
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedId(item.vendorId);
                                setOpen(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {item.logoUrl && imageUrls[item.logoUrl] ? (
                            <img
                              src={imageUrls[item.logoUrl]}
                              className="w-16 h-16 rounded-full object-cover"
                              alt="Vendor Logo"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                              No Image
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-lg text-gray-900">
                              {item.businessName || "-"}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              {item.veg ? (
                                <Leaf className="w-4 h-4 text-green-500" />
                              ) : (
                                <Flame className="w-4 h-4 text-orange-500" />
                              )}
                              <span>{item.veg ? "Veg" : "Non-Veg"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Description:
                            </span>
                            <p className="text-gray-600 line-clamp-2">
                              {item.description || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              FSSAI License:
                            </span>
                            <p className="text-gray-600">
                              {item.fssaiLicense || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Rating:
                            </span>
                            <p className="text-gray-600 flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              {(item.rating || 0).toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Prep Time:
                            </span>
                            <p className="text-gray-600">
                              {item.preparationTimeMin || 0} min
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Min Order:
                            </span>
                            <p className="text-gray-600">
                              ₹{item.minOrderAmount || 0}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Status:
                            </span>
                            <p
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.activeStatus
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-500"
                              }`}
                            >
                              {item.activeStatus ? "Active" : "Inactive"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4">
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
              <div className="flex flex-col items-center justify-center mt-12 text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No Vendors Found
                </h2>
                <p className="text-gray-500">
                  Add a new vendor to get started!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "grey.500",
            }}
          >
            <X className="w-5 h-5" />
          </IconButton>
          <Typography variant="h6" component="h2" mb={2} fontFamily="Nunito">
            Delete Vendor
          </Typography>
          <Typography variant="body1" mb={4} fontFamily="Nunito">
            Are you sure you want to delete this vendor? This action cannot be undone.
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              Yes, Delete
            </Button>
            <Button
              className="w-full sm:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white"
              onClick={handleClose}
              disabled={loading}
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      <AddVendorModal
        open={openModal}
        setOpen={setOpenModal}
        id={selectedId}
        setId={setSelectedId}
        mode={mode}
        setRefresh={setRefresh}
        refresh={refresh}
      />
    </div>
  );
};

export default Restaurant;