import Message from "../../models/Message.js";
import User from "../../models/User.js";
import Chat from "../../models/Chat.js";

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    readBy: [req.user._id],
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const editMessage = async (req, res) => {
    const { messageId, content } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "You can only edit your own messages" });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const fullMessage = await Message.findById(messageId)
        .populate("sender", "name pic email")
        .populate("chat");

    res.json(fullMessage);
};

const deleteMessage = async (req, res) => {
    const { messageId } = req.body;

    const message = await Message.findById(messageId);
    
    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);
    
    res.json({ message: "Message Removed" });
};

export { sendMessage, allMessages, editMessage, deleteMessage };
