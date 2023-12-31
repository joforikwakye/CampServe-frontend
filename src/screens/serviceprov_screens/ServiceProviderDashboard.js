import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../../hooks/useAuth";
import { getProviderInfo } from "../../hooks/SPuseApi";
import Loader from "../../components/Loader";
import { Ionicons } from "@expo/vector-icons";
import RatingsAndReviews from "../../components/RatingsandReviews";
import { Image } from "react-native";
import useSocket from "../../hooks/useSocket";
import * as Animatable from "react-native-animatable";
import { useRef } from "react";
import EditSettingsModal from "../../components/EditSettingsModal";
import useSearch from "../../hooks/useSearch";

const ServiceProviderDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isOffline } = useSocket();
  const [mainData, setMainData] = useState([]);
  const [subData, setSubData] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestSummary, setRequestSummary] = useState([]);
  const [categoriesArray, setCategoriesArray] = useState([]);
  const { editModalVisible, setEditModalVisible } = useSearch();

  const refreshColours = ["#22543D"];
  const isInitialRender = useRef(true);
  const categories = [
    {
      id: 1,
      name: "Room",
      subcategories: ["Laundry", "Room Decoration"],
    },
    {
      id: 2,
      name: "Tutoring",
      subcategories: ["Academic Tutoring", "Exams Preparation"],
    },
    {
      id: 3,
      name: "Design",
      subcategories: ["UI/UX Design", "Graphic Design"],
    },
  ];

  const transformResponseToCategoriesArray = (response, categories) => {
    const transformedCategories = [];
    const updatedCategories = JSON.parse(JSON.stringify(categories));

    if (response.sub_categories) {
      const subcategoriesData = response.sub_categories;
      const subcategoriesToRemove = Object.keys(subcategoriesData);

      updatedCategories.forEach((category) => {
        category.subcategories = category.subcategories.filter(
          (subcategory) => !subcategoriesToRemove.includes(subcategory)
        );

        if (category.subcategories.length > 0) {
          transformedCategories.push(category);
        }
      });
    } else {
      transformedCategories.push(...updatedCategories);
    }

    return transformedCategories;
  };

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setisLoading(true);
        const response = await getProviderInfo(user.provider_id);
        const transformedData = transformResponseToCategoriesArray(
          response,
          categories
        );
        setCategoriesArray(transformedData);
        const { sub_categories, ...otherData } = response;
        setMainData(otherData);
        setSubData(sub_categories);
      } catch (error) {
        console.log(error);
      } finally {
        setisLoading(false);
      }
    };

    if (!isOffline) {
      fetchProviderData();
    }
  }, []);

  useEffect(() => {
    if (!isOffline && !isInitialRender.current) {
      onRefresh();
    } else {
      isInitialRender.current = false;
    }
  }, [isOffline]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    if (!isOffline) {
      try {
        const response = await getProviderInfo(user.provider_id);
        const { sub_categories, ...otherData } = response;
        setMainData(otherData);
        setSubData(sub_categories);
      } catch (error) {
        console.log(error);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setIsRefreshing(false);
    }
  };

  const subcategories = Object.keys(subData);

  useEffect(() => {
    filterBySubcategory(subcategories[0]);
  }, [subData]);

  const filterBySubcategory = (subcategory) => {
    setActiveSubcategory(subcategory);
    const filteredSubcategory = subData[subcategory] || [];
    const { request_summary, ...data } = filteredSubcategory;
    setFilteredData(data);
    setRequestSummary(request_summary);
  };

  const summaryData = [
    { status: "Pending", amount: requestSummary?.pending },
    { status: "In Progress", amount: requestSummary?.in_progress },
    { status: "Completed", amount: requestSummary?.completed },
    { status: "Declined", amount: requestSummary?.declined },
    {
      status: "Total Amount Earned",
      amount: `${requestSummary?.total_amount_earned}`,
    },
  ];

  const getImageBySubCategory = (subCategory) => {
    let image;

    switch (subCategory) {
      case "Featured":
        return require("../../../assets/onboarding4.jpg");
      case "Laundry":
        image = require("../../../assets/sub4.jpg");
        break;
      case "Room Decoration":
        image = require("../../../assets/sub6.jpg");
        break;
      case "Academic Tutoring":
        image = require("../../../assets/sub8.jpg");
        break;
      case "Exams Preparation":
        image = require("../../../assets/sub2.jpg");
        break;
      case "UI/UX Design":
        image = require("../../../assets/sub5.jpg");
        break;
      case "Graphic Design":
        image = require("../../../assets/onboarding1.jpg");
        break;
      default:
        return null;
    }

    return image;
  };

  const imageSource = filteredData.subcategory_image
    ? { uri: `${filteredData.subcategory_image}` }
    : getImageBySubCategory(activeSubcategory);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "#B2CCFF", text: "#084B8A" };
      case "In Progress":
        return { bg: "#FFF7AA", text: "#D1A800" };
      case "Completed":
        return { bg: "#A2D9A1", text: "#007F00" };
      case "Declined":
        return { bg: "#FFB2B2", text: "#B30000" };
      case "Total Amount Earned":
        return { bg: "white", text: "gray" };
    }
  };

  const providerDetails = {
    user_id: user.user_id,
    provider_id: user.provider_id,
    business_name: mainData?.business_name,
    bio: mainData?.bio,
    contact: mainData?.contact,
    subcategories: Object.entries(subData).map(([subcategory, details]) => ({
      subcategory,
      subcategory_image: details?.subcategory_image
        ? { uri: `${details?.subcategory_image}` }
        : getImageBySubCategory(subcategory),
      description: details?.description,
    })),
  };

  const renderItem = ({ item }) => {
    const statusColor = getStatusStyles(item.status);
    return (
      <Animatable.View
        className="p-2 rounded-xl mr-3"
        animation="pulse"
        iterationCount="infinite"
        duration={5000}
        style={{
          backgroundColor:
            statusColor?.bg !== undefined ? statusColor?.bg : "white",
          borderRadius: 8,
          margin: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
          height: 80,
          flex: 1,
        }}
      >
        <View className={`flex-1 justify-center items-center`}>
          <Text
            style={{ color: statusColor?.text }}
            className="text-lg font-bold"
          >
            {item.status}
          </Text>
          <Text
            className="text-base font-semibold"
            style={{ color: statusColor?.text }}
          >
            {item.status == "Total Amount Earned" && "GH¢"} {item.amount}
          </Text>
        </View>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView className="bg-white px-4 flex-1">
      <CustomHeader
        showMenuIcon={true}
        OpenDrawer={() => navigation.openDrawer()}
        setEditModalVisible={() => setEditModalVisible(true)}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {mainData.length !== 0 ? (
            <FlatList
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  colors={refreshColours}
                />
              }
              showsVerticalScrollIndicator={false}
              data={[1]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={() => (
                <>
                  <Text className="text-2xl text-[#0A4014] font-bold">
                    General Details
                  </Text>
                  <View className="flex justify-around space-y-2 py-2 mb-4">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="business-outline"
                        size={20}
                        color="green"
                      />
                      <Text className="text-xl font-bold capitalize ml-2">
                        {mainData.business_name}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color="green"
                      />
                      <Text className=" capitalize ml-2">{mainData.bio}</Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons name="call-outline" size={20} color="green" />
                      <Text className="ml-2">{mainData.contact}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xl  text-[#0A4014] font-bold">
                      Services Offered
                    </Text>
                    <TouchableOpacity
                      className="bg-green-600 px-3 py-1 rounded-lg flex-row gap-1"
                      onPress={() =>
                        navigation.navigate("AddService", { categoriesArray })
                      }
                    >
                      <Ionicons
                        name="add-outline"
                        size={24}
                        color="black"
                        style={{ marginBottom: 2 }}
                      />
                      <Text className="text-base">Add Service</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row justify-around items-center">
                    <ScrollView
                      style={{ flex: 1 }}
                      contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "center",
                      }}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="gap-2 my-2"
                    >
                      {Object.values(subcategories).map((subcategory) => (
                        <TouchableOpacity
                          key={subcategory}
                          className={`px-4 py-2 rounded-xl ${
                            activeSubcategory === subcategory
                              ? "bg-[#22543D]"
                              : "bg-gray-300"
                          }`}
                          onPress={() => filterBySubcategory(subcategory)}
                        >
                          <Text
                            className={`text-base font-bold ${
                              activeSubcategory === subcategory
                                ? "text-white"
                                : "text-black"
                            }`}
                          >
                            {subcategory}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View
                    className="flex flex-1 ml-[2px]"
                    style={{
                      backgroundColor: "white",
                      borderRadius: 8,
                      margin: 8,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                      height: 250,
                    }}
                  >
                    <View className="h-1/2">
                      <Image
                        source={imageSource}
                        style={{
                          flex: 1,
                          width: "100%",
                          height: undefined,
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                        }}
                        resizeMode="contain"
                      />
                    </View>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ flexGrow: 1 }}
                      className="pb-4 px-4"
                    >
                      <View className="pt-4">
                        <Text className=" text-lg font-bold">Description</Text>
                        <View className="bg-white rounded-lg py-2">
                          <Text className="text-base text-gray-600">
                            {filteredData.description}
                          </Text>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                  <View className="border border-gray-100 m-2 mx-4" />

                  <View className="py-2 px-4">
                    <Text className="font-bold text-lg">Request Summary</Text>
                  </View>
                  <FlatList
                    data={summaryData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={2}
                  />

                  <View className="border border-gray-100 m-2 mx-4" />

                  {filteredData.rating_details !== undefined && (
                    <RatingsAndReviews
                      key={activeSubcategory}
                      rating={filteredData.rating_details}
                    />
                  )}
                </>
              )}
            />
          ) : (
            <ScrollView
              contentContainerStyle={{ flex: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  colors={refreshColours}
                />
              }
            >
              <View className="flex-1 items-center justify-center">
                <Text className="text-base font-semibold text-center">
                  No data
                </Text>
              </View>
            </ScrollView>
          )}
        </>
      )}
      <EditSettingsModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        providerDetails={providerDetails}
      />
    </SafeAreaView>
  );
};

export default ServiceProviderDashboard;
