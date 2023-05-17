import { useState } from "react";

import { GoKebabVertical } from "react-icons/go";
import { HiPlus } from "react-icons/hi";
import TextEditor from "../components/TextEditor";
//

function Campaigns() {
  const [isAdd, setIsAdd] = useState(false);

  return (
    <div className="bg-[--light-brown] h-screen">
      <div className="flex flex-col px-52">
        <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
          Campaigns
        </p>

        <div className="flex justify-between w-full items-center mb-5">
          <div className="flex gap-5">
            <input
              type="text"
              placeholder="Search..."
              className="py-2 px-5 bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
              onChange={(e) => {}}
            />
            <div className="hs-dropdown relative inline-flex">
              <button
                type="button"
                className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                onClick={() => {}}
              >
                Category
              </button>
            </div>
          </div>
          <div className="flex gap-5">
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
        {isAdd ? (
          <TextEditor />
        ) : (
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
float-left cursor-pointer appearance-none border border-solid border-2  border-[--light-gray] bg-[--light-gray] 
bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-[''] 
checked:border-0 checked:border-transparent checked:bg-[--dark-green] checked:after:opacity-100"
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
              <tr className="w-1/2 pl-12">
                <td className="mr-5 flex justify-start truncate text-ellipsis">
                  Start/Effectivity Date
                </td>
              </tr>
            </thead>
            <tbody className="flex flex-col max-h-[624px] overflow-y-auto">
              <tr>
                <td className="flex mx-1 px-5 mb-1 py-3">
                  <div className="flex gap-5 items-center w-1/2">
                    <div className="w-5 h-5">
                      <input
                        id="checkbox-1"
                        className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 
 checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
 float-left cursor-pointer appearance-none border border-solid border-2  border-[--dark-green] bg-[--light-green] 
 bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
 after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-[''] 
 checked:border-0 checked:border-transparent checked:bg-[--dark-green] checked:after:opacity-100 mr-1"
                        type="checkbox"
                      />
                    </div>
                    <img
                      src="https://scontent.fmnl4-2.fna.fbcdn.net/v/t39.30808-6/346973659_639876427540304_5985302877770816813_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=730e14&_nc_eui2=AeGuFeB12xS1Io_bdF8Dqj1CVyLxW1QbYhtXIvFbVBtiG1yHVldfE9opFhQyU9Tb5gNFpzesJJAQvouS8IDkIq-r&_nc_ohc=WzqAK4y40FEAX9SuwXF&_nc_zt=23&_nc_ht=scontent.fmnl4-2.fna&oh=00_AfBPiYhfHtlvnXzFvXc_bVmvhfr5Ts1sjdANZ5jnMi0LSQ&oe=646AA6F4"
                      alt=""
                      className="w-[60px] h-[60px] rounded-lg"
                    />
                    <div className="flex flex-col justify-between h-full py-1">
                      <p className="font-bold">Sing from the heart </p>
                      <p className="w-[608px] text-ellipsis truncate text-sm">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Ullam consectetur, eos officiis veritatis minima eius
                        ipsa maiores molestias necessitatibus error, esse et
                        vel, sapiente placeat consequatur similique quasi?
                        Officiis quas earum ea? Consequatur nobis quis provident
                        hic necessitatibus similique qui nesciunt eius quos, ea
                        quod perferendis fugiat rem at mollitia!
                      </p>
                    </div>
                  </div>
                  <div className="pl-12 flex gap-5 w-1/2 items-center">
                    <div className="w-2/5 text-sm flex flex-col justify-between h-full py-2">
                      <p className=" text-sm">Created: May 11, 2023</p>
                      <p className="font-bold text-sm">Due: May 18, 2023</p>
                    </div>
                    <div className="w-2/5 flex flex-col justify-center gap-2">
                      <div className="flex justify-between w-full text-sm">
                        <p>Remaining</p>
                        <p>2d</p>
                      </div>
                      <div className="w-full">
                        <div className="rounded-lg h-2 bg-[#00d2ff]/20">
                          <div
                            className="rounded-lg h-2"
                            style={{
                              backgroundImage:
                                "linear-gradient(to left top, #3a7bd5, #00d2ff)",
                              width: "100%",
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
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Campaigns;
