import { useState, useEffect } from "react";
import axios from "../../api/axios";
import Loading from "../Loading";

import { HiPlus } from "react-icons/hi";
import { VscEdit } from "react-icons/vsc";
import { BsFillTrash3Fill } from "react-icons/bs";
import { BiXCircle, BiCheckCircle } from "react-icons/bi";

function QoutesTable({
  auth,
  toast,
  setIsOpenAddModal,
  setIsOpenEditModal,
  isOpenEditModal,
  setAuthor,
  setQuote,
  quotes,
  setQuotes,
  author,
  quote,
  setId,
  setStatus,
  handleSubmitEditQuote,
  handleSubmitUpdateStatusQuote,
  handleDeleteQuotes,
}) {
  const [isAllChecked, setIsAllChecked] = useState(false);

  const [editQuotes, setEditQuotes] = useState([]);
  const [deleteQuotes, setDeleteQuotes] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setQuotes(
      quotes.map((i) => {
        i["isChecked"] = false;
        if (i["isActive"] === true) {
          i["isActiveString"] = "active";
        } else {
          i["isActiveString"] = "";
        }
        return i;
      })
    );
  }, []);

  useEffect(() => {
    if (isOpenEditModal === false) {
      setEditQuotes([]);
      setDeleteQuotes([]);
      setQuotes(
        quotes.map((i) => {
          return { ...i, isChecked: false };
        })
      );
    }
  }, [isOpenEditModal]);

  const handleAllChecked = () => {
    setQuotes(
      quotes.map((i) => {
        if (!isAllChecked) {
          setIsAllChecked(true);
          return { ...i, isChecked: true };
        } else {
          setIsAllChecked(false);
          return { ...i, isChecked: false };
        }
      })
    );

    if (!isAllChecked) {
      const ids = quotes.map((i) => i.id);
      setDeleteQuotes(ids);
    } else {
      setDeleteQuotes([]);
    }
  };

  const handleChecked = (id, isCheckedParam, authorName, quoteDesc) => {
    setQuotes(
      quotes.map((i, k) => {
        return id === i.id ? { ...i, isChecked: !i.isChecked } : i;
      })
    );

    if (!isCheckedParam) {
      setDeleteQuotes([...deleteQuotes, id]);
      setEditQuotes([
        ...editQuotes,
        {
          id,
          authorName,
          quoteDesc,
        },
      ]);
    } else {
      setDeleteQuotes(deleteQuotes.filter((i) => i !== id));
      setEditQuotes(editQuotes.filter((i) => i.id !== id));
      setAuthor("");
      setQuote("");
    }
  };

  return (
    <div className="w-full mt-5">
      <div className="w-full justify-end flex justify-between">
        <input
          type="text"
          placeholder="Search..."
          className="py-2 px-5 bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <div className="flex gap-5">
          {deleteQuotes.length ? (
            <button
              className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
              onClick={() => {
                handleDeleteQuotes(deleteQuotes);
              }}
            >
              <BsFillTrash3Fill size={14} />
              Delete
            </button>
          ) : (
            <button
              className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] transition-all duration-300 opacity-50"
              disabled
            >
              <BsFillTrash3Fill size={14} />
              Delete
            </button>
          )}
          {editQuotes.length === 1 ? (
            <button
              className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
              onClick={() => {
                setAuthor("");
                setQuote("");
                setId("");

                if (editQuotes.length === 1) {
                  setAuthor(editQuotes[0].authorName);
                  setQuote(editQuotes[0].quoteDesc);
                  setId(editQuotes[0].id);
                }
                setIsOpenEditModal(true);
              }}
            >
              <VscEdit size={14} />
              Edit
            </button>
          ) : (
            <button
              className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black transition-all duration-300 opacity-50"
              disabled
            >
              <VscEdit size={14} />
              Edit
            </button>
          )}
          <button
            className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
            onClick={() => {
              setAuthor("");
              setQuote("");
              setIsOpenAddModal(true);
            }}
          >
            <HiPlus size={16} />
            Add
          </button>
        </div>
      </div>
      <table
        className="w-full rounded-lg shadow-lg bg-[--light-green] relative mt-5"
        style={{ backgroundColor: "rgba(169, 230, 194, 0.2)" }}
      >
        <thead className="flex px-5 py-3 text-sm text-[--light-brown] font-bold bg-[--dark-green] rounded-lg m-1">
          <tr className="w-1/5">
            <td className="flex gap-5 items-center">
              <input
                id="checkbox-1"
                className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 
checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
float-left cursor-pointer appearance-none border border-solid border-2  border-[--light-gray] checked:border-[--light-gray] checked:border-2 bg-[--light-gray] 
bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['✔'] 
checked:bg-[--dark-green] checked:after:opacity-100"
                type="checkbox"
                style={{
                  fontFamily: "FontAwesome",
                }}
                checked={isAllChecked ? true : false}
                onChange={handleAllChecked}
              />
              <p className="mr-5 flex justify-start truncate text-ellipsis">
                Author
              </p>
            </td>
          </tr>
          <tr className="w-[600px]">
            <td className="mr-5 flex justify-start truncate text-ellipsis">
              Qoute
            </td>
          </tr>
          <tr className="w-1/5">
            <td className="mr-5 flex justify-start truncate text-ellipsis">
              Status
            </td>
          </tr>
          <tr className="w-1/5">
            <td className="mr-5 flex justify-start truncate text-ellipsis">
              Options
            </td>
          </tr>
        </thead>
        <tbody className="flex flex-col max-h-[576px] overflow-y-auto">
          {quotes?.length ? (
            quotes
              ?.filter((i) => {
                if (search?.toLowerCase().trim()) {
                  return i?.author
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                    i?.quote.toLowerCase().includes(search.toLowerCase()) ||
                    i?.isActive === true
                    ? "active"
                        .toString()
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    : ""
                        .toString()
                        .toLowerCase()
                        .includes(search.toLowerCase());
                } else {
                  return i;
                }
              })
              ?.map((i, k) => {
                return (
                  <tr key={k}>
                    <td
                      className={`flex font-medium mx-1 px-5 mb-1 py-3 text-sm ${
                        k % 2 ? "bg-[--light-green] rounded-lg" : null
                      } ${
                        i.isChecked
                          ? "relative bg-[--light-green] rounded-lg"
                          : null
                      }`}
                      //   onClick={() => {
                      //     handleChecked(i?.id, i?.isChecked, i?.author, i?.quote);
                      //   }}
                    >
                      {i.isChecked ? (
                        <div className="absolute w-[8px] h-full bg-[--dark-green] left-0 top-0 rounded-tl-lg rounded-bl-lg"></div>
                      ) : null}
                      <p className="w-1/5 flex gap-5 items-center ">
                        <input
                          id="checkbox-1"
                          className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 
checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
float-left cursor-pointer appearance-none border border-solid border-2  border-[--dark-green] bg-[--light-green] 
bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['✔'] 
checked:border-0 checked:border-transparent checked:bg-[--dark-green] checked:after:opacity-100 mr-1"
                          type="checkbox"
                          style={{
                            fontFamily: "FontAwesome",
                          }}
                          onChange={() => {
                            handleChecked(
                              i?.id,
                              i?.isChecked,
                              i?.author,
                              i?.quote
                            );
                          }}
                          checked={i.isChecked ? true : false}
                        />
                        <p className="mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                          <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white">
                            {i?.author}
                          </div>
                          {i?.author}
                        </p>
                      </p>
                      <p className="w-[600px] mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                        <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                          {i?.quote}
                        </div>
                        {i?.quote}
                      </p>
                      <p className="w-1/5 mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                        <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                          {i?.isActive ? "Active" : ""}
                        </div>
                        {i?.isActive ? "Active" : ""}
                      </p>
                      <p className="w-1/5 mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                        <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                          {i?.isActive ? "Deactivate" : "Activate"}
                        </div>
                        {i?.isActive ? (
                          <button
                            className="hover:underline duration-300"
                            onClick={(e) => {
                              handleSubmitUpdateStatusQuote(
                                i?.author,
                                i?.quote,
                                i?.id,
                                false
                              );
                            }}
                          >
                            <div className="text-[--red] flex gap-1 items-center">
                              <BiXCircle />
                              <p className="font-bold">Deactivate</p>
                            </div>
                          </button>
                        ) : (
                          <button
                            className="hover:underline duration-300"
                            onClick={(e) => {
                              handleSubmitUpdateStatusQuote(
                                i?.author,
                                i?.quote,
                                i?.id,
                                true
                              );
                            }}
                          >
                            <div className="text-[--dark-green] flex gap-1 items-center">
                              <BiCheckCircle />
                              <p className="font-bold">Activate</p>
                            </div>
                          </button>
                        )}
                      </p>
                    </td>
                  </tr>
                );
              })
          ) : (
            <Loading />
          )}
        </tbody>
      </table>
    </div>
  );
}

export default QoutesTable;
