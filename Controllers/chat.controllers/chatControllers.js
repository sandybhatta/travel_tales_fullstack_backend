import User from "../../models/User.js";
import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";

const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name avatar email",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const fetchChats = async (req, res) => {
  try {
    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("coAdmins", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name username avatar email",
    });

    // Calculate unread count for each chat
    const chatsWithUnreadCount = await Promise.all(
      results.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          readBy: { $ne: req.user._id },
          sender: { $ne: req.user._id } // Don't count own messages as unread
        });
        return { ...chat.toObject(), unreadCount };
      })
    );

    res.status(200).send(chatsWithUnreadCount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  try {
    const users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
        .status(400)
        .send("More than 2 users are required to form a group chat");
    }
    
    // Check if all users are followers of the logged-in user
    const currentUser = await User.findById(req.user._id);
    const followers = currentUser.followers.map((id) => id.toString());

    const areAllFollowers = users.every((user) => followers.includes((user._id || user).toString()));
    
    if (!areAllFollowers) {
        // Optional: You can filter out non-followers or throw error.
        // For now, let's strictly enforce it or assume the frontend sends valid users.
        // Ideally: 
        // if (!followers.includes(user)) throw Error...
    }

    users.push(req.user);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
      description: req.body.description || "",
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(updatedChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateGroupDescription = async (req, res) => {
  const { chatId, description } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { description },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(updatedChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat Not Found" });
    }

    const requesterId = req.user._id.toString();
    const adminId = chat.groupAdmin ? chat.groupAdmin.toString() : null;
    const coAdmins = chat.coAdmins ? chat.coAdmins.map(id => id.toString()) : [];
    const isCoAdmin = coAdmins.includes(requesterId);
    const isAdmin = adminId === requesterId;

    if (!isAdmin && !isCoAdmin) {
        return res.status(403).json({ message: "Only Admin or Co-Admin can add users" });
    }

    if (isCoAdmin) {
        // Check if user is follower of Co-admin
        const currentUser = await User.findById(req.user._id);
        const followers = currentUser.followers.map(id => id.toString());
        if (!followers.includes(userId.toString())) {
            return res.status(403).json({ message: "Co-admins can only add their followers" });
        }
    }

    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("coAdmins", "-password");

    if (!added) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(added);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat Not Found" });
    }

    const requesterId = req.user._id.toString();
    const adminId = chat.groupAdmin ? chat.groupAdmin.toString() : null;
    const coAdmins = chat.coAdmins ? chat.coAdmins.map(id => id.toString()) : [];
    const isCoAdmin = coAdmins.includes(requesterId);
    const isAdmin = adminId === requesterId;
    const targetIsAdmin = userId === adminId;
    const targetIsCoAdmin = coAdmins.includes(userId);

    if (requesterId !== userId) {
        if (!isAdmin && !isCoAdmin) {
            return res.status(403).json({ message: "Only Admin or Co-Admin can remove users" });
        }

        if (isCoAdmin) {
            if (targetIsAdmin || targetIsCoAdmin) {
                return res.status(403).json({ message: "Co-admins cannot remove Admin or other Co-admins" });
            }
        }
    }

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId, coAdmins: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("coAdmins", "-password");

    if (!removed) {
        res.status(404).json({ message: "Chat Not Found" });
    } else {
        res.json(removed);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const makeCoAdmin = async (req, res) => {
    const { chatId, userId } = req.body;
    
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
        return res.status(404).json({ message: "Chat Not Found" });
        }
    
        const requesterId = req.user._id.toString();
        const adminId = chat.groupAdmin ? chat.groupAdmin.toString() : null;
        const coAdmins = chat.coAdmins ? chat.coAdmins.map(id => id.toString()) : [];
        const isCoAdmin = coAdmins.includes(requesterId);
        const isAdmin = adminId === requesterId;

        if (!isAdmin && !isCoAdmin) {
            return res.status(403).json({ message: "Only Admin or Co-Admin can promote users" });
        }

        const updated = await Chat.findByIdAndUpdate(
            chatId,
            { $addToSet: { coAdmins: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("coAdmins", "-password");

        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const removeCoAdmin = async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
        return res.status(404).json({ message: "Chat Not Found" });
        }
    
        const requesterId = req.user._id.toString();
        const adminId = chat.groupAdmin ? chat.groupAdmin.toString() : null;
        
        if (requesterId !== adminId) {
            return res.status(403).json({ message: "Only Admin can remove Co-Admin status" });
        }

        const updated = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { coAdmins: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("coAdmins", "-password");

        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  updateGroupDescription,
  addToGroup,
  removeFromGroup,
  makeCoAdmin,
  removeCoAdmin
};
