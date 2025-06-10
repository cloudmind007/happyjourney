import { FC, useEffect, useState } from "react";
import api from "../utils/axios";
import LoaderModal from "../components/LoaderModal";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import Pagination from "../components/Pagination";
import { Button } from "@/components/ui/button";
import { Box, Modal, Typography, IconButton } from "@mui/material";
import AddStation from "@/components/AddStation";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: 2,
  p: 4,
};

const Station: FC = () => {
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [page, setPage] = useState({
    current_page: 1,
    to: 0,
    total: 0,
    from: 0,
    per_page: 10,
    remainingPages: 0,
    last_page: 0,
  });

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
    try {
      const res = await api.delete(`/stations/${selectedId}`);
      if (res.status === 200) {
        setRefresh(!refresh);
      }
    } catch (error) {
      console.error("Failed to delete data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getData = async (pageNumber = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/stations?page=${pageNumber - 1}&size=${pageSize}`
      );

      setListData(res.data.content || []);

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
      setPage((prev) => ({ ...prev, per_page: newSize, current_page: 1 }));
      getData(1, newSize);
    }
  };

  useEffect(() => {
    getData(page.current_page, page.per_page);
  }, [refresh]);

  return (
    <div>
      {loading ? (
        <LoaderModal />
      ) : (
        <div className="h-full w-full">
          <div className="h-16 flex justify-between items-center bg-white px-4">
            <div className="">
              <div className="flex gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-1 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                    <Search className="size-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="searchQuery"
                    className="max-w-md p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-3xl outline-none"
                    placeholder="Search "
                    // onChange={(e: any) => setSearch(e.target.value)}
                  />
                  <select
                    value={page.per_page}
                    onChange={handlePageSizeChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 ml-3"
                  >
                    <option value={10}>10 Records Per Page</option>
                    <option value={25}>25 Records Per Page</option>
                    <option value={50}>50 Records Per Page</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-2">
                <div
                  onClick={handleOpenAddModal}
                  className="flex justify-center items-center py-1.5 px-3 gap-2 bg-[#303fe8] text-white rounded-lg font-light shadow-lg cursor-pointer"
                >
                  <Plus />
                  Add
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-3">
            {listData.length > 0 ? (
              <div className="p-4 bg-white">
                <table className="min-w-full border-separate">
                  <thead className="w-full">
                    <tr className="rounded-md w-full text-center py-4">
                      <th className="px-2 text-sm py-3 font-medium text-black">
                        Sr. No.
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        Station Code
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        Station Name
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        City Name
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        State Name
                      </th>
                      <th className="px-2 text-sm py-3 text-center font-medium text-black tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listData.map((item: any, index) => (
                      <tr
                        key={index}
                        className="text-center bg-white shadow-md text-sm"
                      >
                        <td className="px-2 py-4 font-medium text-black rounded-tl-lg rounded-bl-lg">
                          {(page.current_page - 1) * page.per_page + index + 1}
                        </td>
                        <td className="px-2 py-4 font-medium text-black">
                          {item.stationCode}
                        </td>
                        <td className="px-2 py-4 font-medium text-black">
                          {item.stationName}
                        </td>
                        <td className="px-2 py-4 font-medium text-black">
                          {item.city}
                        </td>
                        <td className="px-2 py-4 font-medium text-black">
                          {item.state}
                        </td>
                        <td className="px-2 py-4 font-medium rounded-tr-lg rounded-br-lg">
                          <div className="flex gap-2 justify-center items-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleOpenEditModal(item.stationId)
                              }
                              className="p-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                console.log("View station:", item.id)
                              }
                              className="p-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button> */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedId(item.stationId);
                                setOpen(true);
                              }}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="w-full mt-4">
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
                <h2 className="text-xl font-semibold mb-4">No DATA Found</h2>
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
            <X />
          </IconButton>

          <Typography variant="h6" component="h2" mb={2} fontFamily={"Nunito"}>
            Delete Station
          </Typography>

          <Typography variant="body1" mb={4} fontFamily={"Nunito"}>
            Are you sure you want to delete this record?
          </Typography>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, Delete
            </Button>
            <Button className="bg-gray-600" onClick={handleClose}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      <AddStation
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

export default Station;
