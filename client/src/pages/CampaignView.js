import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { HiArrowLongRight } from "react-icons/hi2";

import { Markup } from "interweave";

import { toHeaderCase } from "js-convert-case";

import "swiper/css";
import "swiper/css/pagination";

import { Pagination } from "swiper";

import { IoChevronBackOutline } from "react-icons/io5";

import katotoWatch from "../assets/katoto/katoto-watch.png";
import Loading from "../components/Loading";

function CampaignView({ token, auth, toast }) {
  const [campaigns, setCampaigns] = useState([]);

  const [campaignInfo, setCampaignInfo] = useState("");
  const [search, setSearch] = useState("");
  const [announcementFilter, setAnnouncementFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [webinarFilter, setWebinarFilter] = useState("");
  const [campaignTitle, setCampaignTitle] = useState("");

  const [isShow, setIsShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [quote, setQuote] = useState({});

  useEffect(() => {
    (async () => {
      await handleGetPublishedCampaign();
      await getQuote();
      setIsLoading(false);
    })();
  }, []);

  const getQuote = async () => {
    try {
      await axios
        .get("/api/train/get-quote", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setQuote(res?.data?.quote);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleGetPublishedCampaign = async () => {
    try {
      await axios
        .get("/api/campaigns/get-published", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          const newCampaigns = res?.data?.campaigns?.map((i) => {
            i["effectivityDate"] = convertDate(i["effectivityDate"])[1];
            return i;
          });

          setCampaigns(newCampaigns);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const convertDate = (date) => {
    const formattedDate = new Date(date);

    const convertedDateTime = formattedDate.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Singapore",
    });

    const convertedDate = formattedDate.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Singapore",
    });

    const convertedTime = formattedDate.toLocaleString("en-PH", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Singapore",
    });

    return [convertedDateTime, convertedDate, convertedTime];
  };

  const filteredCampaigns = () => {
    const newCampaigns = campaigns
      ?.filter((i) => {
        if (search?.toLowerCase().trim()) {
          return (
            i?.title.toLowerCase().includes(search.toLowerCase()) ||
            i?.effectivityDate.toLowerCase().includes(search.toLowerCase()) ||
            i?.description.toLowerCase().includes(search.toLowerCase()) ||
            i?.campaignType.toLowerCase().includes(search.toLowerCase())
          );
        } else {
          return i;
        }
      })
      ?.filter((i) => {
        if (announcementFilter?.toLowerCase().trim()) {
          return i?.campaignType
            .toLowerCase()
            .includes(announcementFilter?.toLowerCase().trim());
        } else if (eventFilter?.toLowerCase().trim()) {
          return i?.campaignType
            .toLowerCase()
            .includes(eventFilter?.toLowerCase().trim());
        } else {
          return i;
        }
      });

    return newCampaigns;
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-[--light-brown] pt-2 min-h-screen pb-32">
          <div className="flex flex-col">
            {isShow ? (
              <div className="pt-20 px-60">
                <div className="w-full pb-12 flex gap-3">
                  <span>
                    <button
                      onClick={() => {
                        setIsShow(false);
                      }}
                      className="text-[--dark-green] hover:underline"
                    >
                      Campaigns
                    </button>{" "}
                    / {toHeaderCase(campaignTitle)}
                  </span>
                </div>
                <Markup content={campaignInfo} />
              </div>
            ) : (
              <>
                <div className="mt-16 h-96 px-60 flex w-full mb-8 items-center bg-[url('./assets/campaign-bg-sample.jpg')] bg-center bg-no-repeat bg-cover">
                  <div className="items-start w-3/5 h-fit flex flex-col glass p-10 gap-5 text-[--light-brown]">
                    <p className="text-3xl font-extrabold">
                      Join us on our campaigns!
                    </p>
                    <p>
                      Come and be a part of our inclusive events, where we will
                      explore the importance of mental well-being, share
                      strategies for coping with everyday challenges, breaking
                      the stigma and create a supportive community dedicated to
                      nurturing positive mental health for all.
                    </p>
                  </div>
                  <Swiper
                    pagination={{
                      dynamicBullets: true,
                    }}
                    modules={[Pagination]}
                    className="mySwiper w-1/3 rounded-xl -mt-[60px]"
                  >
                    {/* {campaigns?.map((i, k) => {
                      return (
                        <SwiperSlide
                          key={k}
                          onClick={() => {
                            setIsShow(true);
                            setCampaignInfo(i?.campaignInfo);
                          }}
                        >
                          <div className="flex justify-center items-center h-[600px] w-full">
                            <img
                              src={i?.imageHeader}
                              alt=""
                              className="flex justify-center items-center cursor-pointer"
                            />
                          </div>
                        </SwiperSlide>
                      );
                    })} */}
                  </Swiper>
                </div>
                <div className="flex w-full gap-10 px-60">
                  <div className="w-[300px] flex flex-col gap-5">
                    <p className="font-extrabold">Refine Results</p>
                    <p>
                      Filters and preferences automatically apply to results
                      when selected.
                    </p>
                    <div className="mt-3">
                      <p className="mb-3 font-bold text-xs">
                        What are you looking for?
                      </p>
                      <input
                        type="text"
                        placeholder="Search..."
                        className=" py-2 px-5 bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <p className="mb-3 font-bold text-xs">Preferences</p>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-3 items-center">
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
                              setAnnouncementFilter(
                                announcementFilter ? "" : "announcement"
                              );
                            }}
                            checked={announcementFilter ? true : false}
                          />
                          <label htmlFor="checkbox-1">Announcement</label>
                        </div>
                        <div className="flex gap-3 items-center">
                          <input
                            id="checkbox-2"
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
                              setEventFilter(eventFilter ? "" : "event");
                            }}
                            checked={eventFilter ? true : false}
                          />
                          <label htmlFor="checkbox-2">Event</label>
                        </div>
                        <div className="flex gap-3 items-center">
                          <input
                            id="checkbox-3"
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
                              setWebinarFilter(webinarFilter ? "" : "webinar");
                            }}
                            checked={webinarFilter ? true : false}
                          />
                          <label htmlFor="checkbox-3">Webinar</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-4/5 flex flex-col gap-8 max-screen">
                    <p className="font-extrabold">Upcoming Campaigns</p>
                    <div className="flex gap-5">
                      {filteredCampaigns()?.map((i, k) => {
                        return (
                          <div
                            className="w-1/3 flex flex-col border-[1px] border-black/20 rounded-xl"
                            key={k}
                          >
                            <div className="relative">
                              {i?.imageHeader ? (
                                <img
                                  src={i?.imageHeader}
                                  className="w-full rounded-t-xl h-[200px] cursor-pointer"
                                  onClick={() => {
                                    setIsShow(true);
                                    setCampaignInfo(i?.campaignInfo);
                                    setCampaignTitle(i?.title);
                                  }}
                                ></img>
                              ) : (
                                <div
                                  onClick={() => {
                                    setIsShow(true);
                                    setCampaignInfo(i?.campaignInfo);
                                    setCampaignTitle(i?.title);
                                  }}
                                  className="w-full bg-gradient-to-t from-[--light-green] to-[#1cd8d2] h-[200px] rounded-t-xl cursor-pointer"
                                ></div>
                              )}
                              <div className="bg-[--dark-green] rounded-full py-1 px-2 w-fit text-sm text-[--light-brown] absolute right-4 top-4">
                                {toHeaderCase(i?.campaignType)}
                              </div>
                            </div>

                            <div className="w-full p-5 flex flex-col gap-5">
                              <p
                                className="font-semibold text-[--dark-green] cursor-pointer duration-300 text-2xl"
                                onClick={() => {
                                  setIsShow(true);
                                  setCampaignInfo(i?.campaignInfo);
                                  setCampaignTitle(i?.title);
                                }}
                              >
                                {toHeaderCase(i?.title)}
                              </p>
                              <p className="">Until: {i?.effectivityDate}</p>
                              <p className="truncate">{i?.description}</p>
                              <button
                                className="h-fit w-fit bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                                onClick={() => {
                                  setIsShow(true);
                                  setCampaignInfo(i?.campaignInfo);
                                  setCampaignTitle(i?.title);
                                }}
                              >
                                Learn More <HiArrowLongRight />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default CampaignView;
