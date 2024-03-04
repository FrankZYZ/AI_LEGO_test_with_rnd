import { produce } from "immer";
// Import the suggested function from Zustand
import { createWithEqualityFn } from "zustand/traditional";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { db } from "../firebase"; // Ensure you have this import
import { doc, getDoc, updateDoc, addDoc, collection, arrayUnion, query, where, getDocs, serverTimestamp, deleteDoc } from "firebase/firestore"; // Import Firestore document update functions

const cardsDatatemplates = {
  "8-stage": {
    cardsData: [
      {
        id: "problem-0",
        descr: "",
        details: {},

        position: { x: 100, y: 0 },
      },
      {
        id: "task-0",
        descr: "",
        details: {},
        position: { x: 200, y: 0 },
      },
      {
        id: "data-0",
        descr: "",
        details: {},

        position: { x: 300, y: 0 },
      },
      {
        id: "model-0",
        descr: "",
        details: {},
        prompt: "",
        position: { x: 400, y: 0 },
      },
      {
        id: "train-0",
        descr: "",
        details: {},
        position: { x: 500, y: 0 },
      },
      {
        id: "test-0",
        descr: "",
        details: {},
        position: { x: 600, y: 0 },
      },
      {
        id: "deploy-0",
        descr: "",
        details: {},

        position: { x: 700, y: 0 },
      },
      {
        id: "feedback-0",
        descr: "",
        details: {},

        position: { x: 800, y: 0 },
      },
    ],
    arrows: [
      { start: "problem-0", end: "task-0" },
      { start: "task-0", end: "data-0" },
      { start: "data-0", end: "model-0" },
      { start: "model-0", end: "train-0" },
      { start: "train-0", end: "test-0" },
      { start: "test-0", end: "deploy-0" },
      { start: "deploy-0", end: "feedback-0" },
    ],
  },
  "6-stage": {
    cardsData: [
      {
        id: "problemDef-0",
        descr: "",
        details: {},
        position: { x: 100, y: 0 },
      },
      {
        id: "data-0",
        descr: "",
        details: {},
        position: { x: 200, y: 0 },
      },
      {
        id: "modelDevelopment-0",
        descr: "",
        details: {},
        position: { x: 300, y: 0 },
      },
      {
        id: "modelEvaluation-0",
        descr: "",
        details: {},
        position: { x: 400, y: 0 },
      },
      {
        id: "deploy-0",
        descr: "",
        details: {},
        position: { x: 500, y: 0 },
      },
      {
        id: "MLOps-0",
        descr: "",
        details: {},
        position: { x: 600, y: 0 },
      },
    ],
    arrows: [
      { start: "problemDef-0", end: "data-0" },
      { start: "data-0", end: "modelDevelopment-0" },
      { start: "modelDevelopment-0", end: "modelEvaluation-0" },
      { start: "modelEvaluation-0", end: "deploy-0" },
      { start: "deploy-0", end: "MLOps-0" },
    ],
  },
  "3-stage": {
    cardsData: [
      {
        id: "design-0",
        descr: "",
        details: {},
        position: { x: 100, y: 0 },
      },
      {
        id: "develop-0",
        descr: "",
        details: {},
        position: { x: 200, y: 0 },
      },
      {
        id: "deploy-0",
        descr: "",
        details: {},
        position: { x: 300, y: 0 },
      },
    ],
    arrows: [
      { start: "design-0", end: "develop-0" },
      { start: "develop-0", end: "deploy-0" },
    ],
  },
};

const prompts = {
  problem:
    "Brief the problem or challenge that can be solved by AI in simple words, highlighting its significance and potential impact on target users or stakeholders.",
  task: "Explain how AI focuses on the specific task that aims to solve the problem.",
  data: "Describe how the data for training the AI system is collected and prepared in plain language, emphasizing the data preprocessing and any feature engineering technologies that are applied to the raw data.",
  model:
    "Explain what AI model architecture and algorithms are being used and  and their respective roles in simple terms.",
  train:
    "Describe how the AI model learns from the data, and clarify the process of how it improves its performance.",
  test: "Explain how the AI model is evaluated and assessed for its effectiveness and accuracy, using plain words to highlight the testing process.",
  deploy:
    "Describe how the AI system is deployed in practical use, emphasizing the benefits and potential impact on users or stakeholders.",
  feedback:
    "Explain how feedback is gathered from users or stakeholders to improve the AI system and highlight how it helps the iteration of AI development.",
};

const myStore = (set) => ({
  projectId: null,
  cards: [],
  links: [],

  pullProject: async (projectId) => {
    const projectDocSnap = await getDoc(doc(db, "projects", projectId));
    if (!projectDocSnap.exists()) {
      // Creat new project
      console.error("Should never be called [Project not found");
      return;
    }
    const projectData = projectDocSnap.data();

    const cardFetchPromises = projectData.cards.map(cardId =>
      getDoc(doc(db, "cards", cardId)).then(cardDocSnap => cardDocSnap.data())
    );
    const cards = await Promise.all(cardFetchPromises);

    set(state => ({
      ...state,
      projectId: projectId,
      links: projectData.links,
      cards: cards,
    }));
  },

  addCardData: async (stage) => {
    const { projectId, cards } = useMyStore.getState();
    if (projectId == null) {
      throw new Error("null projectId");
    }

    const rightmostX = cards.reduce((max, card) => Math.max(card.position.x, max), 0);
    const newPosition = { x: rightmostX + 170, y: 0 };

    const newCard = {
      projectId: projectId,
      uid: "", // Temporarily empty, will be filled with doc ID
      stage: stage,
      prompt: prompts[stage] || "No prompt available",
      description: "",
      comments: [],
      position: newPosition,
    };

    try {
      const cardDocRef = await addDoc(collection(db, "cards"), newCard);

      set(produce((store) => {
        newCard.uid = cardDocRef.id;
        store.cards.push(newCard);
      }));

      await updateDoc(cardDocRef, { uid: cardDocRef.id }); // Update the card with its UID

      await updateDoc(doc(db, "projects", projectId), {
        cards: arrayUnion(cardDocRef.id),
        lastUpdatedTime: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding/updating card:", error);
    }
  },

  setCardDescription: async (id, newDescription) => {
    set((state) => ({
      ...state,
      cards: state.cards.map((card) =>
        card.uid === id ? { ...card, description: newDescription } : card
      ),
    }));
    const cardDocRef = doc(db, "cards", id);
    try {
      await updateDoc(cardDocRef, { description: newDescription });
    } catch (error) {
      console.error("Error updating card description: ", error);
    }
  },
  setCardPosition: async (id, position) => {
    set((state) => ({
      ...state,
      cards: state.cards.map((card) =>
        card.uid === id ? { ...card, position: position } : card
      ),
    }));
    const cardDocRef = doc(db, "cards", id);
    try {
      await updateDoc(cardDocRef, { position: position });
    } catch (error) {
      console.error("Error updating card description: ", error);
    }
  },

  // Refs is {start: cardId, end: cardId} (must be dict)
  addLink: async (refs) => {
    if (refs.start === refs.end)
      return;
    set(
      produce((store) => {
        if (!store.links.includes(refs)) {
          store.links.push(refs);
        }
      })
    );

    const { projectId } = useMyStore.getState();

    if (projectId) {
      try {
        const projectDocRef = doc(db, "projects", projectId);
        const projectDocSnap = await getDoc(projectDocRef);
        const currentLinks = projectDocSnap.data().links || [];
        const updatedLinks = [...currentLinks, refs];
        await updateDoc(projectDocRef, { links: updatedLinks });
      } catch (error) {
        console.error("Error updating arrows in Firestore:", error);
      }
    } else {
      console.error("projectId is not set, unable to update arrows in Firestore");
    }
  },

  refreshLinks: () =>
    set(
      produce((store) => {
        store.links = [...store.links];
      })
    ),
  // TODO connect to firebase
  // addTemplate: (type) =>
  //   set(
  //     produce((store) => {
  //       if (cardsDatatemplates[type]) {
  //         const updatedCardsData = cardsDatatemplates[type].cardsData.map(
  //           (card) => {
  //             const stageName = card.id.split("-")[0]; // Extract stage name from the id
  //             return {
  //               ...card,
  //               prompt: prompts[stageName] || "No prompt available", // Assign the corresponding prompt
  //             };
  //           }
  //         );

  //         store.cardsData = updatedCardsData;
  //         store.arrows = cardsDatatemplates[type].arrows;
  //       } else {
  //         store.cardsData = [];
  //         store.arrows = [];
  //       }
  //     })
  //   ),

  resetStore: async () => {
    // Delete corresponding firestore data
    const { projectId, cards } = useMyStore.getState();
    if (projectId) {
      try {
        const projectDocRef = await getDoc(doc(db, "projects", projectId));
        await updateDoc(projectDocRef, { links: [], cards: [] });
      } catch (error) {
        console.error("Error updating arrows in Firestore:", error);
      }

      const cardFetchPromises = cards.forEach(cardId => {
        deleteDoc(doc(db, "cards", cardId));
      });
      await Promise.all(cardFetchPromises);

      set({
        cards: [],
        links: [],
        projectId: null,
      });
    }
  },

  cleanStore: async (newProjectId) => {
    // Delete corresponding firestore data
    const { projectId } = useMyStore.getState();
    if (!projectId || projectId === newProjectId)
      return;
    set({
      cards: [],
      links: [],
      projectId: null,
    });
  },

  deleteCardAndLinks: async (cardId) => {
    const { projectId, cards, links } = useMyStore.getState();
    const cardToDelete = cards.find((card) => card.uid === cardId);
    if (cardToDelete && cardToDelete.uid) {
      const cardToDeleteId = cardToDelete.uid;
      const newCardsData = cards.filter((card) => card.uid !== cardId);
      const newLinks = links.filter((link) => link.start !== cardId && link.end !== cardId);
      try {
        useMyStore.setState({ projectId: projectId, cards: newCardsData, links: newLinks });
        await deleteDoc(doc(db, "cards", cardToDeleteId));
        await updateDoc(doc(db, "projects", projectId), {
          cards: newCardsData.map((card) => card.uid),
          links: newLinks
        });
      } catch (error) {
        console.error("Error deleting card and links: ", error);
      }
    }
  }
});

const useMyStore = createWithEqualityFn(devtools(myStore));

export default useMyStore;
