import { useState, useEffect } from "react";
import axios from "../api/axios";
import { Markup } from "interweave";

import { GoKebabVertical } from "react-icons/go";
import { HiPlus } from "react-icons/hi";
import { BsFillTrash3Fill } from "react-icons/bs";
import TextEditor from "../components/TextEditor";

function Campaigns({ toast, auth }) {
  const [addCampaignInfo, setAddCampaignInfo] = useState("");
  const [effectivityDate, setEffectivityDate] = useState("");
  const [title, setTitle] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [imageHeader, setImageHeader] = useState("");
  const [search, setSearch] = useState("");
  const [description, setDescription] = useState("");

  const [isAdd, setIsAdd] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [reload, setReload] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [deleteCampaigns, setDeleteCampaigns] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      handleGetCampaigns();
    }, 500);
  }, [reload]);

  const handleGetCampaigns = async () => {
    try {
      await axios
        .get("/api/campaigns/get", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setCampaigns(res?.data?.campaigns);
        });
    } catch (err) {}
  };

  const handleAddCampaign = async () => {
    try {
      await axios
        .post(
          "/api/campaigns/add",
          {
            isPublished,
            title,
            description,
            campaignType,
            effectivityDate,
            campaignInfo: addCampaignInfo,
            imageHeader,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          setAddCampaignInfo("");
          setEffectivityDate("");
          setTitle("");
          setCampaignType("");
          setIsAdd(false);
          setIsPreview(false);
          setIsPublished(false);
          setReload(!reload);
          toast.success(res?.data?.message);
        });
    } catch (err) {
      toast.error(err?.response?.data);
    }
  };

  const handleChecked = (param, isCheckedParam, id) => {
    setCampaigns(
      campaigns.map((i, k) => {
        return param === k ? { ...i, isChecked: !i.isChecked } : i;
      })
    );

    if (!isCheckedParam) {
      setDeleteCampaigns([...deleteCampaigns, id]);
    } else {
      setDeleteCampaigns(deleteCampaigns.filter((i) => i !== id));
    }
  };

  const handleDeleteCampaigns = async () => {
    try {
      await axios
        .post(
          "/api/campaigns/delete",
          { deleteCampaigns },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
          setDeleteCampaigns([]);
          // setIsAllChecked(false);
          setReload(!reload);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  return (
    <div className="bg-[--light-brown] min-h-screen h-full">
      <div className="flex flex-col px-52">
        <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
          Campaigns
        </p>
        {isPreview ? (
          <>
            <div className="flex justify-between w-full items-center mb-5">
              <div className="flex gap-5">
                <button
                  type="button"
                  className={`bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300 ${
        isPreview
          ? null
          : "ring-[3px] ring-offset-2 ring-black ring-offset-[--light-brown]"
      }`}
                  onClick={() => {
                    setIsPreview(false);
                    setIsAdd(true);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
  border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all 
  duration-300 ${
    isPreview
      ? "ring-[3px] ring-offset-2 ring-[--dark-green] ring-offset-[--light-brown]"
      : null
  }`}
                  onClick={() => {
                    setIsPreview(true);
                  }}
                >
                  Preview
                </button>
              </div>
              <div className="flex gap-5">
                <button
                  type="button"
                  className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure? All changes you've made will be discarded and not saved!"
                      )
                    ) {
                      setAddCampaignInfo("");
                      setIsAdd(false);
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
  border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsPublished(false);
                    handleAddCampaign();
                  }}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
  border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsPublished(true);
                    handleAddCampaign();
                  }}
                >
                  Save and Publish
                </button>
              </div>
            </div>
            <Markup content={addCampaignInfo} />
          </>
        ) : isAdd ? (
          <>
            <div className="flex justify-between w-full items-center mb-5">
              <div className="flex gap-5">
                <button
                  type="button"
                  className={`bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300 ${
        isPreview
          ? null
          : "ring-[3px] ring-offset-2 ring-black ring-offset-[--light-brown]"
      }`}
                  onClick={() => {
                    setIsPreview(false);
                    setIsAdd(true);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
  border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all 
  duration-300 ${
    isPreview
      ? "ring-[3px] ring-offset-2 ring-[--dark-green] ring-offset-[--light-brown]"
      : null
  }`}
                  onClick={() => {
                    setIsPreview(true);
                  }}
                >
                  Preview
                </button>
              </div>
              <div className="flex gap-5">
                <button
                  type="button"
                  className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure? All changes you've made will be discarded and not saved!"
                      )
                    ) {
                      setAddCampaignInfo("");
                      setIsAdd(false);
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
  border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsPublished(false);
                    handleAddCampaign();
                  }}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
  border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsPublished(true);
                    handleAddCampaign();
                  }}
                >
                  Save and Publish
                </button>
              </div>
            </div>
            <div className="flex justify-between w-full items-center mb-5">
              <div className="flex gap-5">
                <div className="flex flex-col ">
                  <label htmlFor="title" className="font-semibold pb-3">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col ">
                  <label htmlFor="campaignType" className="font-semibold pb-3">
                    Campaign Type *
                  </label>
                  <select
                    id="campaignType"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={campaignType}
                    onChange={(e) => {
                      setCampaignType(e.target.value);
                    }}
                    required
                  >
                    <option value="announcement" defaultValue>
                      Announcement
                    </option>
                    <option value="event">Event</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
                <div className="flex flex-col ">
                  <label htmlFor="date" className="font-semibold pb-3">
                    Effectivity Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={effectivityDate}
                    onChange={(e) => {
                      setEffectivityDate(e.target.value);
                    }}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="shadow-lg rounded-xl mb-10">
              <TextEditor
                addCampaignInfo={addCampaignInfo}
                setAddCampaignInfo={setAddCampaignInfo}
                auth={auth}
                setImageHeader={setImageHeader}
                setDescription={setDescription}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between w-full items-center mb-5">
              <div className="flex gap-5">
                <input
                  type="text"
                  placeholder="Search..."
                  className="py-2 px-5 bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
                <div className="hs-dropdown relative inline-flex">
                  {/* <button
                    type="button"
                    className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                    onClick={() => {}}
                  >
                    Category
                  </button> */}
                </div>
              </div>
              <div className="flex gap-5">
                {deleteCampaigns.length ? (
                  <button
                    className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                    onClick={handleDeleteCampaigns}
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
                <button
                  className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                  onClick={() => {
                    setIsAdd(true);
                  }}
                >
                  <HiPlus size={16} />
                  Add
                </button>
              </div>
            </div>
            <table
              className="w-full rounded-lg shadow-lg bg-[--light-green]"
              style={{ backgroundColor: "rgba(169, 230, 194, 0.2)" }}
            >
              <thead className="flex px-5 py-3 text-sm text-[--light-brown] font-bold bg-[--dark-green] rounded-lg m-1">
                <tr className="w-1/2">
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
                    />
                    <p className="mr-5 flex justify-start truncate text-ellipsis">
                      Campaign Information
                    </p>
                  </td>
                </tr>
                {console.log(deleteCampaigns)}
                <tr className="w-1/2 pl-12">
                  <td className="mr-5 flex justify-start truncate text-ellipsis">
                    Created/Effectivity Date
                  </td>
                </tr>
              </thead>
              <tbody className="flex flex-col max-h-[624px] overflow-y-auto">
                <tr>
                  {campaigns
                    ?.filter((i) => {
                      if (search?.toLowerCase().trim()) {
                        return i?.title
                          .toLowerCase()
                          .includes(search.toLowerCase());
                      } else {
                        return i;
                      }
                    })
                    ?.map((i, k) => {
                      return (
                        <td
                          key={k}
                          className={`flex font-medium mx-1 px-5 mb-1 py-3 text-sm ${
                            k % 2 ? "bg-[--light-green] rounded-lg" : null
                          }`}
                          onClick={() => {
                            handleChecked(k, i.isChecked, i?.id);
                          }}
                        >
                          <div className="flex gap-5 items-center w-1/2">
                            <div className="w-5 h-5">
                              <input
                                id="checkbox-1"
                                className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 
checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
float-left cursor-pointer appearance-none border border-solid border-2  border-[--dark-green] bg-[--light-green] 
bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['✔'] 
checked:border-0 checked:border-transparent checked:bg-[--dark-green] checked:after:opacity-100 mr-1"
                                type="checkbox"
                                onChange={() => {
                                  handleChecked(k, i.isChecked, i?.id);
                                }}
                                checked={i.isChecked ? true : false}
                              />
                            </div>
                            {i?.imageHeader ? (
                              <img
                                src={i?.imageHeader}
                                alt=""
                                className="w-[60px] h-[60px] rounded-lg"
                              />
                            ) : (
                              <div className="w-[60px] h-[60px] rounded-lg bg-[--dark-green] flex justify-center items-center text-3xl font-extrabold text-white">
                                {i?.title[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col justify-between h-full py-1">
                              <p className="font-bold">{i?.title}</p>
                              <p className="w-[608px] text-ellipsis truncate text-sm">
                                <div>{i?.description}</div>
                              </p>
                            </div>
                          </div>
                          <div className="pl-12 flex gap-5 w-1/2 items-center">
                            <div className="w-2/5 text-sm flex flex-col justify-between h-full py-2">
                              <p className=" text-sm">
                                Created:&nbsp;
                                {new Date(
                                  new Date(
                                    i?.createDate?._seconds * 1000 +
                                      i?.createDate?._nanoseconds / 1000000
                                  )
                                    .toLocaleDateString()
                                    .split("/")[2],
                                  new Date(
                                    i?.createDate?._seconds * 1000 +
                                      i?.createDate?._nanoseconds / 1000000
                                  )
                                    .toLocaleDateString()
                                    .split("/")[0] - 1,
                                  new Date(
                                    i?.createDate?._seconds * 1000 +
                                      i?.createDate?._nanoseconds / 1000000
                                  )
                                    .toLocaleDateString()
                                    .split("/")[1]
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="font-bold text-sm">
                                Until:&nbsp;
                                {new Date(
                                  new Date(i?.effectivityDate)
                                    .toLocaleDateString()
                                    .split("/")[2],
                                  new Date(i?.effectivityDate)
                                    .toLocaleDateString()
                                    .split("/")[0] - 1,
                                  new Date(i?.effectivityDate)
                                    .toLocaleDateString()
                                    .split("/")[1]
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="w-2/5 flex flex-col justify-center gap-2">
                              <div className="flex justify-between w-full text-sm">
                                <p>Remaining</p>
                                <p>
                                  {Math.ceil(
                                    (new Date(i?.effectivityDate).getTime() -
                                      new Date().getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )}
                                  d
                                </p>
                              </div>
                              <div className="w-full">
                                <div className="rounded-lg h-2 bg-black/20">
                                  <div
                                    className="rounded-lg h-2"
                                    style={{
                                      background:
                                        "linear-gradient(90deg, rgba(45,117,124,1) 0%, rgba(0,0,0,1) 100%)",
                                      width: `${
                                        (1 -
                                          Math.ceil(
                                            (new Date(
                                              i?.effectivityDate
                                            ).getTime() -
                                              new Date().getTime()) /
                                              (1000 * 60 * 60 * 24)
                                          ) /
                                            Math.ceil(
                                              (new Date(
                                                i?.effectivityDate
                                              ).getTime() -
                                                new Date(
                                                  new Date(
                                                    i?.createDate?._seconds *
                                                      1000 +
                                                      i?.createDate
                                                        ?._nanoseconds /
                                                        1000000
                                                  ).toLocaleDateString()
                                                ).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                            )) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="w-1/5 flex justify-end">
                              <button className="pointer">
                                <GoKebabVertical size={24} />
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default Campaigns;
