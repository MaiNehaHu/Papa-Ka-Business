import React, { useEffect, useState } from "react";
import { appColors } from "@/constants/appColors";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useNavigation } from "expo-router";

const DanaEntry = () => {
  const date = todayDate();
  const navigation = useNavigation();
  const route = useLocalSearchParams();
  const { dealerName } = route;

  const [fetchedList, setFetchedList] = useState([]);
  const [data, setData] = useState({
    rate: 0,
    danaType: "",
    bagWeight: 0,
    totalBags: 0,
    duePayment: 0,
    totalWeight: 0,
    paidPayment: 0,
    totalPayment: 0,
    date: todayDate(),
  });

  const handleSubmit = async () => {
    try {
      // Create a new object with the entered data and the generated key
      const newDataEntry = { key: uniqueKey(), ...data };

      // Find the dealer in the fetched list
      const existingDealerIndex = fetchedList.findIndex(
        (dealer) => dealer.dealerName === dealerName
      );

      if (existingDealerIndex !== -1) {
        fetchedList[existingDealerIndex].danaEntry.push(newDataEntry);
      }

      // Save the updated fetched list to AsyncStorage
      await AsyncStorage.setItem("dana_entry", JSON.stringify(fetchedList));

      Alert.alert("Added successfully");

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error("Error handling submit:", error);
      // Handle error here, e.g., display an error message to the user
    }
  };

  function uniqueKey() {
    return `${Math.ceil(Math.random() * Math.pow(10, 5))}`;
  }

  function todayDate() {
    const today = new Date();

    const date = today.getDate();
    const month = today.getMonth() + 1; // Adding 1 to get the correct month
    const year = today.getFullYear();

    return `${date}/${month}/${year}`;
  }

  useEffect(() => {
    const loadList = async () => {
      try {
        const list = await AsyncStorage.getItem("dana_entry");
        if (list !== null) {
          setFetchedList(JSON.parse(list));
        }
      } catch (error) {
        console.error("Error loading dealer list:", error);
      }
    };

    loadList();
  }, []);

  useEffect(() => {
    setData({ ...data, totalWeight: data.totalBags * data.bagWeight });
  }, [data.totalBags, data.bagWeight]);

  useEffect(() => {
    setData({ ...data, totalPayment: data.rate * data.totalWeight });
  }, [data.rate, data.totalWeight]);

  useEffect(() => {
    setData({ ...data, duePayment: data.totalPayment - data.paidPayment });
  }, [data.totalPayment, data.paidPayment]);

  React.useEffect(() => {
    if (dealerName) {
      navigation.setOptions({ title: `${dealerName} Dana Entry` });
    }
  }, [dealerName, navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Date:</Text>
        <Text>{date}</Text>
      </View>

      <Text style={styles.label}>Dana Type</Text>
      <TextInput
        style={styles.input}
        value={data.danaType}
        onChangeText={(text) => setData({ ...data, danaType: text })}
        placeholder="Enter dana type"
      />

      <Text style={styles.label}>Rate</Text>
      <TextInput
        style={styles.input}
        value={data.rate}
        onChangeText={(text) => setData({ ...data, rate: text })}
        keyboardType="numeric"
        placeholder="Enter rate"
      />

      <Text style={styles.label}>Total Bags</Text>
      <TextInput
        style={styles.input}
        value={data.totalBags}
        onChangeText={(text) => setData({ ...data, totalBags: text })}
        keyboardType="numeric"
        placeholder="Enter total bags"
      />

      <Text style={styles.label}>One Bag Weight (Kg)</Text>
      <TextInput
        style={styles.input}
        value={data.bagWeight}
        onChangeText={(text) => setData({ ...data, bagWeight: text })}
        keyboardType="numeric"
        placeholder="Enter bag weight"
      />

      <View style={styles.row}>
        <Text style={styles.label}>Total Weight:</Text>
        <Text>{data.totalWeight} KG</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Total Payment:</Text>
        <Text>₹ {data.totalPayment}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Due Payment:</Text>
        <Text>₹ {data.duePayment}</Text>
      </View>

      <Text style={styles.label}>Paid Payment</Text>
      <TextInput
        style={styles.input}
        value={data.paidPayment}
        keyboardType="numeric"
        onChangeText={(text) => setData({ ...data, paidPayment: text })}
        placeholder="₹ Enter total payment"
      />

      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginVertical: 8,
  },
  input: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingVertical: 5,
    borderColor: "#ccc",
    paddingHorizontal: 10,
  },
  submit: {
    marginTop: 10,
    width: "100%",
    borderRadius: 10,
    backgroundColor: appColors.blue,
  },
  submitText: {
    padding: 10,
    fontSize: 20,
    textAlign: "center",
    color: appColors.white,
  },
  row: {
    gap: 10,
    display: "flex",
    flexDirection: "row",
    marginVertical: 2,
    alignItems: "center",
  },
});

export default DanaEntry;
